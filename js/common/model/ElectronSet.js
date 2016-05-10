// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var ConstantDensityPropagator = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/ConstantDensityPropagator' );

  function ElectronSet( circuit ) {
    var electronSet = this;
    this.particles = new ObservableArray();
    this.propagator = new ConstantDensityPropagator( this, circuit );
    this.listeners = [];
    // TODO: add function to circuit
    circuit.addCircuitElementRemovedListener( function( circuitElement ) {
      electronSet.removeElectrons( circuitElement );
    } );
  }

  return inherit( Object, ElectronSet, {
    getDensity: function( circuitElement ) {
      return this.getParticles( circuitElement ).length / circuitElement.length;
    },
    clear: function() {
      this.particles.clear();
    },
    getParticles: function( circuitElement ) {
      return this.particles.filter( function( particle ) {return particle.circuitElement === circuitElement;} );
    },
    removeParticles: function( circuitElement ) {
      this.particles.removeAll( this.getParticles( circuitElement ) );
    },
    step: function( dt ) {
      this.propagator.step( dt );
    },

    getUpperNeighborInBranch: function( myelectron ) {
      var branchElectrons = this.getParticles( myelectron.circuitElement ).getArray();
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
    },

    getLowerNeighborInBranch: function( myelectron ) {
      var branchElectrons = this.getParticles( myelectron.circuitElement ).getArray();
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
    }
  } );
} );