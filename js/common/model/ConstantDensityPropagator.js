// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SmoothData = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/SmoothData' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var PropertySet = require( 'AXON/PropertySet' );

  // constants
  var FIRE_CURRENT = 10;
  var MIN_CURRENT = Math.pow( 10, -10 );
  var ELECTRON_DX = CircuitConstructionKitConstants.electronDX;
  var MAX_STEP = ELECTRON_DX * .43;
  var numEqualize = 2;
  var speedScale = .01 / 0.03;
  var timeScale = 100;
  var highestSoFar = null;//for debugging

  var getUpperNeighborInBranch = function( particleSet, myelectron ) {
    var branchElectrons = particleSet.filter( function( particle ) {return particle.circuitElement === myelectron.circuitElement;} ).getArray();
    var upper = null;
    var dist = Number.POSITIVE_INFINITY;
    for ( var i = 0; i < branchElectrons.length; i++ ) {
      var electron = branchElectrons[ i ];
      if ( electron !== myelectron ) {
        var yourDist = electron.distance;
        var myDist = myelectron.distance;
        if ( yourDist > myDist ) {
          var distance = yourDist - myDist;
          if ( distance < dist ) {
            dist = distance;
            upper = electron;
          }
        }
      }
    }
    return upper;
  };

  var getLowerNeighborInBranch = function( particleSet, myelectron ) {
    var branchElectrons = particleSet.filter( function( particle ) {return particle.circuitElement === myelectron.circuitElement;} ).getArray();
    var lower = null;
    var dist = Number.POSITIVE_INFINITY;
    for ( var i = 0; i < branchElectrons.length; i++ ) {
      var electron = branchElectrons[ i ];
      if ( electron !== myelectron ) {
        var yourDist = electron.distance;
        var myDist = myelectron.distance;
        if ( yourDist < myDist ) {
          var distance = myDist - yourDist;
          if ( distance < dist ) {
            dist = distance;
            lower = electron;
          }
        }
      }
    }
    return lower;
  };

  function ConstantDensityPropagator( circuit, particleSet ) {
    this.particleSet = particleSet;
    this.circuit = circuit;
    this.scale = 1;
    this.smoothData = new SmoothData( 30 );
    this.timeScalingPercentValue = null;
    PropertySet.call( this, {
      timeScalePercentString: '100'
    } );
  }

  var createCircuitLocation = function( branch, distance ) {
    assert && assert( branch.containsScalarLocation( distance ), 'branch should contain distance' );
    return {
      branch: branch,
      distance: distance,
      getDensity: function( particleSet ) {
        var particles = particleSet.filter( function( particle ) {return particle.circuitElement === branch;} ); // TODO: Factor out
        return particles.length / branch.length;
      }
    };
  };

  circuitConstructionKit.register( 'ConstantDensityPropagator', ConstantDensityPropagator );

  return inherit( PropertySet, ConstantDensityPropagator, {
    step: function( dt ) {
      dt = dt * timeScale;
      var maxCurrent = this.getMaxCurrent();
      var maxVelocity = maxCurrent * speedScale;
      var maxStep = maxVelocity * dt;
      if ( maxStep >= MAX_STEP ) {
        this.scale = MAX_STEP / maxStep;
      }
      else {
        this.scale = 1;
      }
      this.smoothData.addData( this.scale * 100 );
      this.timeScalingPercentValue = this.smoothData.getAverage();

      var percent = this.timeScalingPercentValue.toFixed( 2 );
      if ( percent === '0' ) {
        percent = '1';
      }
      this.timeScalePercentString = percent;
      for ( var i = 0; i < this.particleSet.length; i++ ) {
        var e = this.particleSet.get( i );
        this.propagate( e, dt );
      }

      //maybe this should be done in random order, otherwise we may get artefacts.
      for ( i = 0; i < numEqualize; i++ ) {
        this.equalizeAll( dt );
      }
    },
    getMaxCurrent: function() {
      var max = 0;
      var circuitElements = this.circuit.getCircuitElements();
      for ( var i = 0; i < circuitElements; i++ ) {
        var current = circuitElements[ i ].current;
        max = Math.max( max, Math.abs( current ) );
      }
      return max;
    },
    equalizeAll: function( dt ) {
      var indices = [];
      for ( var i = 0; i < this.particleSet.length; i++ ) {
        indices.push( i );
      }
      _.shuffle( indices );
      for ( i = 0; i < this.particleSet.length; i++ ) {
        this.equalizeElectron( this.particleSet.get( indices[ i ] ), dt );
      }
    },
    equalizeElectron: function( electron, dt ) {

      //if it has a lower and upper neighbor, try to get the distance to each to be half of ELECTRON_DX
      var upper = getUpperNeighborInBranch( this.particleSet, electron, electron.circuitElement );
      var lower = getLowerNeighborInBranch( this.particleSet, electron, electron.circuitElement );
      if ( upper === null || lower === null ) {
        return;
      }
      var sep = upper.distance - lower.distance;
      var myloc = electron.distance;
      var midpoint = lower.distance + sep / 2;

      var dest = midpoint;
      var distMoving = Math.abs( dest - myloc );
      var vec = dest - myloc;
      var sameDirAsCurrent = vec > 0 && electron.circuitElement.current > 0;
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
      var current = e.circuitElement.current;

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
      // TODO: put the density in the location object
      var min = Number.POSITIVE_INFINITY;
      var argmin = null;
      for ( var i = 0; i < circuitLocations.length; i++ ) {
        var density = circuitLocations[ i ].getDensity( this.particleSet );
        if ( density < min ) {
          min = density;
          argmin = circuitLocations[ i ];
        }
      }
      return argmin;
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
        var current = neighbor.current;
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