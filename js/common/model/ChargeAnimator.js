// Copyright 2016, University of Colorado Boulder

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
  var Util = require( 'DOT/Util' );

  // constants
  var CURRENT_THRESHOLD = 1E-8;

  // If the current is lower than this, then there is no charge movement
  var MIN_CURRENT = Math.pow( 10, -10 );

  // The furthest an charge can step in one frame before the time scale must be reduced (to prevent a strobe effect)
  var MAX_POSITION_CHANGE = CircuitConstructionKitConstants.CHARGE_SEPARATION * 0.43;

  // Number of times to spread out charges so they don't get bunched up.
  var NUMBER_OF_EQUALIZE_STEPS = 2;

  // Factor that multiplies the current to attain speed in screen coordinates per second
  var SPEED_SCALE = 100 / 3;

  /**
   * Sets the charge to not update its position, so that we may apply batch changes without impacting performance
   * @param {Charge} charge
   * @constructor
   */
  var DISABLE_UPDATES = function( charge ) {
    charge.updatingPositionProperty.set( false );
  };

  /**
   * Sets the charge to update its position after a batch of changes has been made.
   * @param {Charge} charge
   * @constructor
   */
  var ENABLE_UPDATES = function( charge ) {
    charge.updatingPositionProperty.set( true );
  };

  /**
   * Gets the absolute value of the current in a circuit element.
   * @param {CircuitElement} circuitElement
   * @return {number}
   * @constructor
   */
  var CURRENT_MAGNITUDE = function( circuitElement ) {
    return Math.abs( circuitElement.currentProperty.get() );
  };

  /**
   * Returns an object that indicates a position in a circuit element and can compute the charge density in that
   * circuit element, so we can find the one with the lowest density and move the charge there.
   *
   * @param {Circuit} circuit - the entire circuit
   * @param {CircuitElement} circuitElement - the circuit element
   * @param {number} distance - the distance along the circuit element
   * @return {Object} combining circuitElement, distance and density
   */
  var createCircuitLocation = function( circuit, circuitElement, distance ) {
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( circuitElement.containsScalarLocation( distance ), 'circuitElement should contain distance' );
    return {
      circuitElement: circuitElement,
      distance: distance,
      density: circuit.getChargesInCircuitElement( circuitElement ).length / circuitElement.chargePathLength
    };
  };

  /**
   * @param {Circuit} circuit
   * @constructor
   */
  function ChargeAnimator( circuit ) {

    // @private (read-only) the ObservableArray of Charge instances
    this.charges = circuit.charges;

    // @private (read-only) the Circuit
    this.circuit = circuit;

    // @private (read-only) factor that reduces the overall propagator speed when maximum speed is exceeded
    this.scale = 1;

    // @private (read-only) a running average over last time steps
    this.timeScaleRunningAverage = new RunningAverage( 30 );

    // @public (read-only)
    this.timeScaleProperty = new NumberProperty( 1, { range: { min: 0, max: 1 } } ); // 1 is full speed, 0.5 is running at half speed, etc.
  }

  circuitConstructionKitCommon.register( 'ChargeAnimator', ChargeAnimator );

  return inherit( Object, ChargeAnimator, {

    /**
     * Update the location of the charges based on the circuit currents
     * @param {number} dt - elapsed time in seconds
     * @public
     */
    step: function( dt ) {

      // Disable incremental updates to improve performance.  The ChargeNodes are only updated once, instead of
      // incrementally many times throughout this update
      this.charges.forEach( DISABLE_UPDATES );

      // dt would ideally be around 16.666ms = 0.0166 sec.  Cap it to avoid too large of an integration step.
      dt = Math.min( dt, 1 / 30 );

      // Find the fastest current in any circuit element
      var maxCurrentMagnitude = _.max( this.circuit.circuitElements.getArray().map( CURRENT_MAGNITUDE ) );
      var maxSpeed = maxCurrentMagnitude * SPEED_SCALE;
      var maxPositionChange = maxSpeed * dt;

      // Slow down the simulation if the fastest step distance exceeds the maximum allowed step
      this.scale = maxPositionChange >= MAX_POSITION_CHANGE ? MAX_POSITION_CHANGE / maxPositionChange : 1;

      // Average over scale values to smooth them out
      var averageScale = this.timeScaleRunningAverage.updateRunningAverage( this.scale );
      this.timeScaleProperty.set( averageScale );

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
      this.charges.forEach( ENABLE_UPDATES );
    },

    /**
     * Make the charges repel each other so they don't bunch up.
     * @param {number} dt - the elapsed time in seconds
     * @private
     */
    equalizeAll: function( dt ) {

      // Update them in a stochastic order to avoid systematic sources of error building up.
      var indices = phet.joist.random.shuffle( _.range( this.charges.length ) );
      for ( var i = 0; i < this.charges.length; i++ ) {
        var charge = this.charges.get( indices[ i ] );

        // No need to update charges in chargeLayoutDirty circuit elements, they will be replaced anyways.  Skipping
        // chargeLayoutDirty circuitElements improves performance
        if ( !charge.circuitElement.chargeLayoutDirty ) {
          this.equalizeCharge( charge, dt );
        }
      }
    },

    /**
     * Adjust the charge so it is more closely centered between its neighbors.  This prevents charges from getting
     * too bunched up.
     * @param {Charge} charge - the charge to adjust
     * @param {number} dt - seconds
     * @private
     */
    equalizeCharge: function( charge, dt ) {

      var circuitElementCharges = this.circuit.getChargesInCircuitElement( charge.circuitElement );

      // if it has a lower and upper neighbor, nudge the charge to be closer to the midpoint
      var sorted = _.sortBy( circuitElementCharges, function( e ) { return e.distanceProperty.get(); } );

      var chargeIndex = sorted.indexOf( charge );
      var upper = sorted[ chargeIndex + 1 ];
      var lower = sorted[ chargeIndex - 1 ];

      // Only adjust a charge if it is between two other charges
      if ( upper && lower ) {
        var neighborSeparation = upper.distanceProperty.get() - lower.distanceProperty.get();
        var currentPosition = charge.distanceProperty.get();

        var desiredPosition = lower.distanceProperty.get() + neighborSeparation / 2;
        var distanceFromDesiredPosition = Math.abs( desiredPosition - currentPosition );
        var sameDirectionAsCurrent = Math.sign( desiredPosition - currentPosition ) ===
                                     Math.sign( charge.circuitElement.currentProperty.get() * charge.charge );

        // When we need to correct in the same direction as current flow, do it quickly.  When going against
        // the current flow, don't go too fast (never run backwards)
        var correctionSpeed = (sameDirectionAsCurrent ? 5.5 : 1) / NUMBER_OF_EQUALIZE_STEPS * SPEED_SCALE;
        var correctionStepSize = Math.abs( correctionSpeed * dt );

        // If far enough away that it won't overshoot, then correct it with one step
        if ( distanceFromDesiredPosition > correctionStepSize ) {

          // move in the appropriate direction maxDX
          if ( desiredPosition < currentPosition ) {
            desiredPosition = currentPosition - correctionStepSize;
          }
          else if ( desiredPosition > currentPosition ) {
            desiredPosition = currentPosition + correctionStepSize;
          }
        }

        // Only update the charge if its new position would be within the same circuit element.
        if ( desiredPosition >= 0 && desiredPosition <= charge.circuitElement.chargePathLength ) {
          charge.distanceProperty.set( desiredPosition );
        }
      }
    },

    /**
     * Move the charge forward in time by the specified amount.
     * @param {Charge} charge - the charge to update
     * @param {number} dt - elapsed time in seconds
     * @private
     */
    propagate: function( charge, dt ) {
      var chargePosition = charge.distanceProperty.get();
      assert && assert( _.isNumber( chargePosition ), 'distance along wire should be a number' );
      var current = charge.circuitElement.currentProperty.get() * charge.charge;

      // Below min current, the charges should remain stationary
      if ( Math.abs( current ) > MIN_CURRENT ) {
        var speed = current * SPEED_SCALE;
        var stepSize = speed * dt * this.scale;
        var newChargePosition = chargePosition + stepSize;

        // Step within a single circuit element
        if ( charge.circuitElement.containsScalarLocation( newChargePosition ) ) {
          charge.distanceProperty.set( newChargePosition );
        }
        else {

          // move to a new CircuitElement
          var overshoot = newChargePosition < 0 ? -newChargePosition : (newChargePosition - charge.circuitElement.chargePathLength);
          var under = newChargePosition < 0;

          assert && assert( !isNaN( overshoot ), 'overshoot should be a number' );
          assert && assert( overshoot >= 0, 'overshoot should be >=0' );

          // enumerate all possible circuit elements the charge could go to
          var circuitLocations = this.getLocations( charge, overshoot, under );
          if ( circuitLocations.length > 0 ) {

            // choose the CircuitElement with the lowest density
            var chosenCircuitLocation = _.minBy( circuitLocations, 'density' );
            assert && assert( chosenCircuitLocation.distance >= 0, 'position should be >=0' );
            charge.setLocation( chosenCircuitLocation.circuitElement, chosenCircuitLocation.distance );
          }
        }
      }
    },

    /**
     * Returns the locations where a charge can flow to (connected circuits with current flowing in the right direction)
     * @param {Charge} charge - the charge that is moving
     * @param {number} overshoot - the distance the charge should appear along the next circuit element
     * @param {boolean} under - determines whether the charge will be at the start or end of the circuit element
     * @return {Object[]} see createCircuitLocation
     * @private
     */
    getLocations: function( charge, overshoot, under ) {
      var vertex = under ?
                   charge.circuitElement.startVertexProperty.get() :
                   charge.circuitElement.endVertexProperty.get();
      var adjacentCircuitElements = this.circuit.getNeighborCircuitElements( vertex );
      var circuitLocations = [];

      //keep only those with outgoing current.
      for ( var i = 0; i < adjacentCircuitElements.length; i++ ) {
        var neighbor = adjacentCircuitElements[ i ];
        var current = neighbor.currentProperty.get() * charge.charge;
        var distAlongNew = null;

        // The linear algebra solver can result in currents of 1E-12 where it should be zero.  For these cases, don't
        // permit charges to flow.
        // TODO: Should the current be clamped after linear algebra?
        if ( current > CURRENT_THRESHOLD && neighbor.startVertexProperty.get() === vertex ) {

          //start near the beginning.
          distAlongNew = Util.clamp( overshoot, 0, neighbor.chargePathLength );
        }
        else if ( current < -CURRENT_THRESHOLD && neighbor.endVertexProperty.get() === vertex ) {

          // start near the end
          distAlongNew = Util.clamp( neighbor.chargePathLength - overshoot, 0, neighbor.chargePathLength );
        }
        else {

          // TODO: does this ever happen?  Should it be forbidden?
        }
        distAlongNew && circuitLocations.push( createCircuitLocation( this.circuit, neighbor, distAlongNew ) );
      }
      return circuitLocations;
    }
  } );
} );