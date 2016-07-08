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
  var PropertySet = require( 'AXON/PropertySet' );

  // constants

  // Number of amps at which a component catches fire
  var FIRE_CURRENT = 10;

  // If the current is lower than this, then there is no electron movement
  var MIN_CURRENT = Math.pow( 10, -10 );

  var MAX_STEP = CircuitConstructionKitConstants.electronDX * 0.43;
  var numEqualize = 2;
  var speedScale = 1 / 3;
  var timeScale = 100;
  var highestSoFar = null;//for debugging

  var getUpperNeighborInBranch = function( circuit, electron, branchElectrons ) {
    var closestUpperNeighbor = null;
    var closestDistance = Number.POSITIVE_INFINITY;
    for ( var i = 0; i < branchElectrons.length; i++ ) {
      var neighborElectron = branchElectrons[ i ];
      if ( neighborElectron !== electron ) {
        var neighborDistance = neighborElectron.distance;
        var electronDistance = electron.distance;
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
        var neighborDistance = neighborElectron.distance;
        var electronDistance = electron.distance;
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

  function ConstantDensityPropagator( circuit ) {
    this.electrons = circuit.electrons;
    this.circuit = circuit;
    this.scale = 1;
    this.smoothData = new SmoothData( 30 );
    this.timeScalingPercentValue = null;
    PropertySet.call( this, {
      timeScale: 1 // between 0 and 1, 1 is full speed (unthrottled)
    } );
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

  circuitConstructionKitCommon.register( 'ConstantDensityPropagator', ConstantDensityPropagator );

  return inherit( PropertySet, ConstantDensityPropagator, {
    step: function( dt ) {

      // Disable incremental updates to improve performance.  The ElectronNodes are only updated once, instead
      // of incrementally many times throughout this update
      for ( var k = 0; k < this.electrons.length; k++ ) {
        this.electrons.get( k ).updating = false;
      }

      // dt would ideally be around 16.666ms = 0.0166 sec
      // let's cap it at double that
      dt = Math.min( dt, 1 / 60 * 2 ) * timeScale;
      var maxCurrent = this.getMaxCurrent(); //TODO: Shouldn't this use abs?
      var maxVelocity = maxCurrent * speedScale;
      var maxStep = maxVelocity * dt;
      if ( maxStep >= MAX_STEP ) {
        this.scale = MAX_STEP / maxStep;
      }
      else {
        this.scale = 1;
      }
      this.smoothData.addData( this.scale );
      this.timeScalingPercentValue = this.smoothData.getAverage();

      this.timeScale = this.timeScalingPercentValue;
      for ( var i = 0; i < this.electrons.length; i++ ) {
        var electron = this.electrons.get( i );

        // Don't update electrons in dirty circuit elements, because they will get a relayout anyways
        if ( !electron.circuitElement.dirty ) {
          this.propagate( electron, dt );
        }
      }

      //maybe this should be done in random order, otherwise we may get artefacts.
      for ( i = 0; i < numEqualize; i++ ) {
        this.equalizeAll( dt );
      }

      // After math complete, update the positions all at once
      for ( k = 0; k < this.electrons.length; k++ ) {
        this.electrons.get( k ).updating = true;
      }
    },
    getMaxCurrent: function() {
      var max = 0;
      var circuitElements = this.circuit.getCircuitElements();
      for ( var i = 0; i < circuitElements.length; i++ ) {
        var current = circuitElements[ i ].current;
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
      var sep = upper.distance - lower.distance;
      var myloc = electron.distance;
      var midpoint = lower.distance + sep / 2;

      var dest = midpoint;
      var distMoving = Math.abs( dest - myloc );
      var vec = dest - myloc;
      var sameDirAsCurrent = vec > 0 && -electron.circuitElement.current > 0;
      var myscale = 1000.0 / 30.0;//to have same scale as 3.17.00
      var correctionSpeed = .055 / numEqualize * myscale;
      if ( !sameDirAsCurrent ) {
        correctionSpeed = .01 / numEqualize * myscale;
      }
      var maxDX = Math.abs( correctionSpeed * dt );

      if ( distMoving > highestSoFar ) {//For debugging.
        highestSoFar = distMoving;
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
        electron.distance = dest;
      }
    },
    propagate: function( e, dt ) {
      var x = e.distance;
      assert && assert( _.isNumber( x ), 'disance along wire should be a number' );
      var current = -e.circuitElement.current;

      if ( current === 0 || Math.abs( current ) < MIN_CURRENT ) {
        return;
      }

      var speed = current * speedScale;
      var dx = speed * dt;
      dx *= this.scale;
      var newX = x + dx;
      var branch = e.circuitElement;
      if ( branch.containsScalarLocation( newX ) ) {
        e.distance = newX;
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
          overshoot = Math.abs( branch.length - newX );
          under = false;
        }
        assert && assert( !isNaN( overshoot ), 'overshoot is NaN' );
        assert && assert( overshoot >= 0, 'overshoot is <0' );
        var locationArray = this.getLocations( e, dt, overshoot, under );
        if ( locationArray.length === 0 ) {
          return;
        }
        //choose the branch with the furthest away electron
        var chosenCircuitLocation = this.chooseDestinationBranch( locationArray );
        e.setLocation( chosenCircuitLocation.branch, Math.abs( chosenCircuitLocation.distance ) );
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
        jroot = branch.startVertex;
      }
      else {
        jroot = branch.endVertex;
      }
      var adjacentBranches = this.circuit.getNeighborCircuitElements( jroot );
      var all = [];
      //keep only those with outgoing current.
      for ( var i = 0; i < adjacentBranches.length; i++ ) {
        var neighbor = adjacentBranches[ i ];
        var current = -neighbor.current;
        if ( current > FIRE_CURRENT ) {
          current = FIRE_CURRENT;
        }
        else if ( current < -FIRE_CURRENT ) {
          current = -FIRE_CURRENT;
        }
        var distAlongNew = null;
        if ( current > 0 && neighbor.startVertex === jroot ) {//start near the beginning.
          distAlongNew = overshoot;
          if ( distAlongNew > neighbor.length ) {
            distAlongNew = neighbor.length;
          }
          else if ( distAlongNew < 0 ) {
            distAlongNew = 0;
          }
          all.push( createCircuitLocation( neighbor, distAlongNew ) );
        }
        else if ( current < 0 && neighbor.endVertex === jroot ) {
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