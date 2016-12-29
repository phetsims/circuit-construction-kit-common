// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * This code governs the movement of electrons, making sure they are distributed equally among the different branches.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SmoothData = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/SmoothData' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Property = require( 'AXON/Property' );

  // constants

  // Number of amps at which a component catches fire
  var FIRE_CURRENT = 10;

  // If the current is lower than this, then there is no electron movement
  var MIN_CURRENT = Math.pow( 10, -10 );

  var MAX_STEP = CircuitConstructionKitConstants.ELECTRON_SEPARATION * 0.43;
  var NUMBER_OF_EQUALIZE_STEPS = 2;
  var SPEED_SCALE = 1 / 3;
  var TIME_SCALE = 100;
  var HIGHEST_SO_FAR = null;//for debugging

  var getUpperNeighborInBranch = function( circuit, electron, branchElectrons ) {
    var closestUpperNeighbor = null;
    var closestDistance = Number.POSITIVE_INFINITY;
    for ( var i = 0; i < branchElectrons.length; i++ ) {
      var neighborElectron = branchElectrons[ i ];
      if ( neighborElectron !== electron ) {
        var neighborDistance = neighborElectron.distanceProperty.get();
        var electronDistance = electron.distanceProperty.get();
        if ( neighborDistance > electronDistance ) {
          var distance = neighborDistance - electronDistance;
          if ( distance < closestDistance ) {
            closestDistance = distance;
            closestUpperNeighbor = neighborElectron;
          }
        }
      }
    }
    return closestUpperNeighbor;
  };

  var getLowerNeighborInBranch = function( circuit, electron, branchElectrons ) {
    var closestLowerNeighbor = null;
    var closestDistance = Number.POSITIVE_INFINITY;
    for ( var i = 0; i < branchElectrons.length; i++ ) {
      var neighborElectron = branchElectrons[ i ];
      if ( neighborElectron !== electron ) {
        var neighborDistance = neighborElectron.distanceProperty.get();
        var electronDistance = electron.distanceProperty.get();
        if ( neighborDistance < electronDistance ) {
          var distance = electronDistance - neighborDistance;
          if ( distance < closestDistance ) {
            closestDistance = distance;
            closestLowerNeighbor = neighborElectron;
          }
        }
      }
    }
    return closestLowerNeighbor;
  };

  function ElectronPropagator( circuit ) {
    this.electrons = circuit.electrons;
    this.circuit = circuit;
    this.scale = 1;
    this.smoothData = new SmoothData( 30 );
    this.timeScalingPercentValue = null;
    this.timeScaleProperty = new Property( 1 ); // between 0 and 1, 1 is full speed (unthrottled)
  }

  var createCircuitLocation = function( branch, distance ) {
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( branch.containsScalarLocation( distance ), 'branch should contain distance' );
    return {
      branch: branch,
      distance: distance,
      getDensity: function( circuit ) {
        var particles = circuit.getElectronsInCircuitElement( branch );
        return particles.length / branch.length;
      }
    };
  };

  circuitConstructionKitCommon.register( 'ElectronPropagator', ElectronPropagator );

  return inherit( Object, ElectronPropagator, {
    step: function( dt ) {

      // Disable incremental updates to improve performance.  The ElectronNodes are only updated once, instead
      // of incrementally many times throughout this update
      for ( var k = 0; k < this.electrons.length; k++ ) {
        this.electrons.get( k ).updatingProperty.set( false );
      }

      // dt would ideally be around 16.666ms = 0.0166 sec
      // let's cap it at double that
      dt = Math.min( dt, 1 / 60 * 2 ) * TIME_SCALE;
      var maxCurrent = this.getMaxCurrentMagnitude();
      var maxVelocity = maxCurrent * SPEED_SCALE;
      var maxStep = maxVelocity * dt;
      if ( maxStep >= MAX_STEP ) {
        this.scale = MAX_STEP / maxStep;
      }
      else {
        this.scale = 1;
      }
      this.smoothData.addData( this.scale );
      this.timeScalingPercentValue = this.smoothData.getAverage();

      this.timeScaleProperty.set( this.timeScalingPercentValue );
      for ( var i = 0; i < this.electrons.length; i++ ) {
        var electron = this.electrons.get( i );

        // Don't update electrons in dirty circuit elements, because they will get a relayout anyways
        if ( !electron.circuitElement.dirty ) {
          this.propagate( electron, dt );
        }
      }

      //maybe this should be done in random order, otherwise we may get artefacts.
      for ( i = 0; i < NUMBER_OF_EQUALIZE_STEPS; i++ ) {
        this.equalizeAll( dt );
      }

      // After math complete, update the positions all at once
      for ( k = 0; k < this.electrons.length; k++ ) {
        this.electrons.get( k ).updatingProperty.set( true );
      }
    },

    /**
     * Returns the absolute value of the most extreme current.
     * @returns {number}
     */
    getMaxCurrentMagnitude: function() {
      var max = 0;
      var circuitElements = this.circuit.getCircuitElements();
      for ( var i = 0; i < circuitElements.length; i++ ) {
        var current = circuitElements[ i ].currentProperty.get();
        max = Math.max( max, Math.abs( current ) );
      }
      return max;
    },
    equalizeAll: function( dt ) {
      var indices = [];
      for ( var i = 0; i < this.electrons.length; i++ ) {
        indices.push( i );
      }
      _.shuffle( indices );
      for ( i = 0; i < this.electrons.length; i++ ) {
        var electron = this.electrons.get( indices[ i ] );

        // No need to update electrons in dirty circuit elements, they will be replaced anyways.  Skipping dirty
        // circuitElements improves performance
        if ( !electron.circuitElement.dirty ) {
          this.equalizeElectron( electron, dt );
        }
      }
    },
    equalizeElectron: function( electron, dt ) {

      var branchElectrons = this.circuit.getElectronsInCircuitElement( electron.circuitElement );

      // if it has a lower and upper neighbor, try to get the distance to each to be half of ELECTRON_DX
      var upper = getUpperNeighborInBranch( this.circuit, electron, branchElectrons );
      var lower = getLowerNeighborInBranch( this.circuit, electron, branchElectrons );
      if ( upper === null || lower === null ) {
        return;
      }
      var sep = upper.distanceProperty.get() - lower.distanceProperty.get();
      var myloc = electron.distanceProperty.get();
      var midpoint = lower.distanceProperty.get() + sep / 2;

      var dest = midpoint;
      var distMoving = Math.abs( dest - myloc );
      var vec = dest - myloc;
      var sameDirAsCurrent = vec > 0 && -electron.circuitElement.currentProperty.get() > 0;
      var myscale = 1000.0 / 30.0;//to have same scale as 3.17.00
      var correctionSpeed = .055 / NUMBER_OF_EQUALIZE_STEPS * myscale;
      if ( !sameDirAsCurrent ) {
        correctionSpeed = .01 / NUMBER_OF_EQUALIZE_STEPS * myscale;
      }
      var maxDX = Math.abs( correctionSpeed * dt );

      if ( distMoving > HIGHEST_SO_FAR ) {//For debugging.
        HIGHEST_SO_FAR = distMoving;
      }

      if ( distMoving > maxDX ) {
        //move in the appropriate direction maxDX
        if ( dest < myloc ) {
          dest = myloc - maxDX;
        }
        else if ( dest > myloc ) {
          dest = myloc + maxDX;
        }
      }
      if ( dest >= 0 && dest <= electron.circuitElement.length ) {
        electron.distanceProperty.set( dest );
      }
    },
    propagate: function( electron, dt ) {
      var x = electron.distanceProperty.get();
      assert && assert( _.isNumber( x ), 'disance along wire should be a number' );
      var current = -electron.circuitElement.currentProperty.get();

      if ( current === 0 || Math.abs( current ) < MIN_CURRENT ) {
        return;
      }

      var speed = current * SPEED_SCALE;
      var dx = speed * dt;
      dx *= this.scale;
      var newX = x + dx;
      var circuitElement = electron.circuitElement;
      if ( circuitElement.containsScalarLocation( newX ) ) {
        electron.distanceProperty.set( newX );
      }
      else {
        //need a new branch.
        var overshoot = 0;
        var under = false;
        if ( newX < 0 ) {
          overshoot = -newX;
          under = true;
        }
        else {

          // TODO: better abstraction for the following line
          overshoot = Math.abs( circuitElement.length - newX );
          under = false;
        }
        assert && assert( !isNaN( overshoot ), 'overshoot is NaN' );
        assert && assert( overshoot >= 0, 'overshoot is <0' );
        var locationArray = this.getLocations( electron, dt, overshoot, under );
        if ( locationArray.length === 0 ) {
          return;
        }
        //choose the branch with the furthest away electron
        var chosenCircuitLocation = this.chooseDestinationBranch( locationArray );
        electron.setLocation( chosenCircuitLocation.branch, Math.abs( chosenCircuitLocation.distance ) );
      }
    },
    chooseDestinationBranch: function( circuitLocations ) {
      var min = Number.POSITIVE_INFINITY;
      var circuitLocationWithLowestDensity = null;
      for ( var i = 0; i < circuitLocations.length; i++ ) {
        var density = circuitLocations[ i ].getDensity( this.circuit );
        if ( density < min ) {
          min = density;
          circuitLocationWithLowestDensity = circuitLocations[ i ];
        }
      }
      return circuitLocationWithLowestDensity;
    },
    getLocations: function( electron, dt, overshoot, under ) {
      var branch = electron.circuitElement;
      var jroot = null;
      if ( under ) {
        jroot = branch.startVertexProperty.get();
      }
      else {
        jroot = branch.endVertexProperty.get();
      }
      var adjacentBranches = this.circuit.getNeighborCircuitElements( jroot );
      var all = [];
      //keep only those with outgoing current.
      for ( var i = 0; i < adjacentBranches.length; i++ ) {
        var neighbor = adjacentBranches[ i ];
        var current = -neighbor.currentProperty.get();
        if ( current > FIRE_CURRENT ) {
          current = FIRE_CURRENT;
        }
        else if ( current < -FIRE_CURRENT ) {
          current = -FIRE_CURRENT;
        }
        var distAlongNew = null;
        if ( current > 0 && neighbor.startVertexProperty.get() === jroot ) {//start near the beginning.
          distAlongNew = overshoot;
          if ( distAlongNew > neighbor.length ) {
            distAlongNew = neighbor.length;
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          all.push( createCircuitLocation( neighbor, distAlongNew ) );
        }
        else if ( current < 0 && neighbor.endVertexProperty.get() === jroot ) {
          distAlongNew = neighbor.length - overshoot;
          if ( distAlongNew > neighbor.length ) {
            distAlongNew = neighbor.length;
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          all.push( createCircuitLocation( neighbor, distAlongNew ) );
        }
      }
      return all;
    }
  } );
} );