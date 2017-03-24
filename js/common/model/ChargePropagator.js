// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * This code governs the movement of charges, making sure they are distributed equally among the different CircuitElements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RunningAverage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/RunningAverage' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants

  // Clamp the current at a maximum.  TODO: Is this truly needed?  It seems like it's responsibility is covered
  // by the speed decrease and fires.
  var MAX_CURRENT = 10;

  // If the current is lower than this, then there is no charge movement
  var MIN_CURRENT = Math.pow( 10, -10 );

  // The furthest an charge can step in one frame before the time scale must be reduced (to prevent a strobe effect)
  var MAX_POSITION_CHANGE = CircuitConstructionKitConstants.CHARGE_SEPARATION * 0.43;

  // Number of times to spread out charges so they don't get bunched up.
  var NUMBER_OF_EQUALIZE_STEPS = 2;

  // Factor that multiplies the current to attain speed in screen coordinates
  var SPEED_SCALE = 1 / 3;

  // Fudge factor to increase dt to make model compatible.  TODO: eliminate this
  var TIME_SCALE = 100;

  var createCircuitLocation = function( circuitElement, distance ) {
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( circuitElement.containsScalarLocation( distance ), 'circuitElement should contain distance' );
    return {
      circuitElement: circuitElement,
      distance: distance,
      getDensity: function( circuit ) {
        var particles = circuit.getChargesInCircuitElement( circuitElement );
        return particles.length / circuitElement.chargePathLength;
      }
    };
  };

  function ChargePropagator( circuit ) {
    this.charges = circuit.charges;
    this.circuit = circuit;
    this.scale = 1;
    this.timeScaleRunningAverage = new RunningAverage( 30 );
    this.timeScalingPercentValue = null;
    this.timeScaleProperty = new NumberProperty( 1, { range: { min: 0, max: 1 } } ); // 1 is full speed, 0.5 is running at half speed, etc.
  }

  circuitConstructionKitCommon.register( 'ChargePropagator', ChargePropagator );

  return inherit( Object, ChargePropagator, {
    step: function( dt ) {

      // Disable incremental updates to improve performance.  The ChargeNodes are only updated once, instead of
      // incrementally many times throughout this update
      for ( var k = 0; k < this.charges.length; k++ ) {
        this.charges.get( k ).updatingPositionProperty.set( false );
      }

      // dt would ideally be around 16.666ms = 0.0166 sec.  Cap it to avoid too large of an integration step.
      dt = Math.min( dt, 1 / 30 ) * TIME_SCALE;
      var maxCurrentMagnitude = this.getMaxCurrentMagnitude();
      var maxSpeed = maxCurrentMagnitude * SPEED_SCALE;
      var maxPositionChange = maxSpeed * dt;
      if ( maxPositionChange >= MAX_POSITION_CHANGE ) {
        this.scale = MAX_POSITION_CHANGE / maxPositionChange;
      }
      else {
        this.scale = 1;
      }
      this.timeScalingPercentValue = this.timeScaleRunningAverage.updateRunningAverage( this.scale );

      this.timeScaleProperty.set( this.timeScalingPercentValue );
      for ( var i = 0; i < this.charges.length; i++ ) {
        var charge = this.charges.get( i );

        // Don't update charges in chargeLayoutDirty circuit elements, because they will get a relayout anyways
        if ( !charge.circuitElement.chargeLayoutDirty ) {
          this.propagate( charge, dt );
        }
      }

      // Spread out the charges so they don't bunch up
      for ( i = 0; i < NUMBER_OF_EQUALIZE_STEPS; i++ ) {
        this.equalizeAll( dt );
      }

      // After computing the new charge positions (possibly across several deltas), trigger the views to update.
      for ( k = 0; k < this.charges.length; k++ ) {
        this.charges.get( k ).updatingPositionProperty.set( true );
      }
    },

    /**
     * Returns the absolute value of the most extreme current.
     * @returns {number}
     */
    getMaxCurrentMagnitude: function() {
      var max = 0;
      for ( var i = 0; i < this.circuit.circuitElements.length; i++ ) {
        var current = this.circuit.circuitElements.get( i ).currentProperty.get();
        max = Math.max( max, Math.abs( current ) );
      }
      return max;
    },

    /**
     * Make the charges repel each other so they don't bunch up.
     * @param {number} dt - the elapsed time in seconds
     */
    equalizeAll: function( dt ) {
      var indices = [];
      for ( var i = 0; i < this.charges.length; i++ ) {
        indices.push( i );
      }
      _.shuffle( indices ); // TODO: This won't be re-seedable
      for ( i = 0; i < this.charges.length; i++ ) {
        var charge = this.charges.get( indices[ i ] );

        // No need to update charges in chargeLayoutDirty circuit elements, they will be replaced anyways.  Skipping
        // chargeLayoutDirty circuitElements improves performance
        if ( !charge.circuitElement.chargeLayoutDirty ) {
          this.equalizeCharge( charge, dt );
        }
      }
    },
    equalizeCharge: function( charge, dt ) {

      var circuitElementCharges = this.circuit.getChargesInCircuitElement( charge.circuitElement );

      // if it has a lower and upper neighbor, try to get the distance to each to be half of ELECTRON_DX
      var sorted = _.sortBy( circuitElementCharges, function( e ) {return e.distanceProperty.get();} );

      var chargeIndex = sorted.indexOf( charge );
      var upper = sorted[ chargeIndex + 1 ];
      var lower = sorted[ chargeIndex - 1 ];

      if ( upper && lower ) {

        var separation = upper.distanceProperty.get() - lower.distanceProperty.get();
        var chargeDistance = charge.distanceProperty.get();

        var dest = lower.distanceProperty.get() + separation / 2;
        var distMoving = Math.abs( dest - chargeDistance );
        var sameDirAsCurrent = (dest - chargeDistance) > 0 && charge.circuitElement.currentProperty.get() * charge.charge > 0;
        var speedScale = 1000.0 / 30.0;//to have same scale as 3.17.00
        var correctionSpeed = .055 / NUMBER_OF_EQUALIZE_STEPS * speedScale;
        if ( !sameDirAsCurrent ) {
          correctionSpeed = .01 / NUMBER_OF_EQUALIZE_STEPS * speedScale;
        }
        var maxDX = Math.abs( correctionSpeed * dt );

        if ( distMoving > maxDX ) {
          //move in the appropriate direction maxDX
          if ( dest < chargeDistance ) {
            dest = chargeDistance - maxDX;
          }
          else if ( dest > chargeDistance ) {
            dest = chargeDistance + maxDX;
          }
        }
        if ( dest >= 0 && dest <= charge.circuitElement.chargePathLength ) {
          charge.distanceProperty.set( dest );
        }
      }
    },
    propagate: function( charge, dt ) {
      var x = charge.distanceProperty.get();
      assert && assert( _.isNumber( x ), 'distance along wire should be a number' );
      var current = charge.circuitElement.currentProperty.get() * charge.charge;

      if ( Math.abs( current ) < MIN_CURRENT ) {
        return;
      }

      var speed = current * SPEED_SCALE;
      var dx = speed * dt;
      dx *= this.scale;
      var newX = x + dx;
      var circuitElement = charge.circuitElement;
      if ( circuitElement.containsScalarLocation( newX ) ) {
        charge.distanceProperty.set( newX );
      }
      else {

        // need a new CircuitElement
        var overshoot = 0;
        var under = false;
        if ( newX < 0 ) {
          overshoot = -newX;
          under = true;
        }
        else {

          // TODO: better abstraction for the following line
          overshoot = Math.abs( circuitElement.chargePathLength - newX );
          under = false;
        }
        assert && assert( !isNaN( overshoot ), 'overshoot is NaN' );
        assert && assert( overshoot >= 0, 'overshoot is <0' );
        var circuitLocations = this.getLocations( charge, dt, overshoot, under );
        if ( circuitLocations.length > 0 ) {

          // choose the CircuitElement with the furthest away charge
          var self = this;
          var chosenCircuitLocation = _.minBy( circuitLocations, function( circuitLocation ) {
            return circuitLocation.getDensity( self.circuit );
          } );
          charge.setLocation( chosenCircuitLocation.circuitElement, Math.abs( chosenCircuitLocation.distance ) );
        }
      }
    },
    getLocations: function( charge, dt, overshoot, under ) {
      var circuitElement = charge.circuitElement;
      var vertex = null;
      if ( under ) {
        vertex = circuitElement.startVertexProperty.get();
      }
      else {
        vertex = circuitElement.endVertexProperty.get();
      }
      var adjacentCircuitElements = this.circuit.getNeighborCircuitElements( vertex );
      var circuitLocations = [];

      //keep only those with outgoing current.
      for ( var i = 0; i < adjacentCircuitElements.length; i++ ) {
        var neighbor = adjacentCircuitElements[ i ];
        var current = neighbor.currentProperty.get() * charge.charge;
        if ( current > MAX_CURRENT ) {
          current = MAX_CURRENT;
        }
        else if ( current < -MAX_CURRENT ) {
          current = -MAX_CURRENT;
        }
        var distAlongNew = null;

        // The linear algebra solver can result in currents of 1E-12 where it should be zero.  For these cases, don't
        // permit charges to flow.
        // TODO: Should the current be clamped after linear algebra?
        var THRESHOLD = 1E-8;
        if ( current > THRESHOLD && neighbor.startVertexProperty.get() === vertex ) {//start near the beginning.
          distAlongNew = overshoot;
          if ( distAlongNew > neighbor.chargePathLength ) {
            distAlongNew = neighbor.chargePathLength;
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          circuitLocations.push( createCircuitLocation( neighbor, distAlongNew ) );
        }
        else if ( current < -THRESHOLD && neighbor.endVertexProperty.get() === vertex ) {
          distAlongNew = neighbor.chargePathLength - overshoot;
          if ( distAlongNew > neighbor.chargePathLength ) {
            distAlongNew = neighbor.chargePathLength;
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          circuitLocations.push( createCircuitLocation( neighbor, distAlongNew ) );
        }
      }
      return circuitLocations;
    }
  } );
} );