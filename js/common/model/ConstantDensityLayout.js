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
  var Electron = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Electron' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );

  // constants
  var electronsVisible = true;
  var ELECTRON_DX = CircuitConstructionKitConstants.electronDX;

  function ConstantDensityLayout( circuit ) {
    this.circuit = circuit;
    this.electrons = circuit.electrons;
  }

  circuitConstructionKit.register( 'ConstantDensityLayout', ConstantDensityLayout );

  return inherit( Object, ConstantDensityLayout, {
    layoutElectrons: function( circuitElement ) {
      var particlesInBranch = this.circuit.getElectronsInCircuitElement( circuitElement );
      this.electrons.removeAll( particlesInBranch );

      if ( electronsVisible ) {
        var offset = ELECTRON_DX / 2;
        var endingPoint = circuitElement.length - offset;

        //compress or expand, but fix a particle at startingPoint and endingPoint.
        var length = endingPoint - offset;
        var desiredDensity = 1 / ELECTRON_DX;
        var N = length * desiredDensity;
        var integralNumberParticles = Math.ceil( N );
        var density = ( integralNumberParticles - 1 ) / length;
        var dx = 1 / density;
        if ( density === 0 ) {
          integralNumberParticles = 0;
        }
        for ( var i = 0; i < integralNumberParticles; i++ ) {
          this.electrons.add( new Electron( circuitElement, i * dx + offset ) );
        }
      }
    }
  } );
} );