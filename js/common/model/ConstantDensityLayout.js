// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Electron = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Electron' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var cleanArray = require( 'PHET_CORE/cleanArray' );

  // constants
  var electronsVisible = true;
  var ELECTRON_DX = CircuitConstructionKitConstants.electronDX;

  function ConstantDensityLayout( circuit ) {
    this.circuit = circuit;
    this.electrons = circuit.electrons;
  }

  circuitConstructionKitCommon.register( 'ConstantDensityLayout', ConstantDensityLayout );

  return inherit( Object, ConstantDensityLayout, {
    layoutElectrons: function( circuitElement ) {
      var particlesInBranch = this.circuit.getElectronsInCircuitElement( circuitElement );
      this.electrons.removeAll( particlesInBranch );

      if ( electronsVisible ) {

        // compress or expand, but fix a particle at startingPoint and endingPoint.
        var offset = ELECTRON_DX / 2;
        var endingPoint = circuitElement.length - offset;
        var startingPoint = offset;
        var length = endingPoint - startingPoint;

        var numberParticles = length / ELECTRON_DX;
        var integralNumberParticles = Math.ceil( numberParticles );
        var density = ( integralNumberParticles - 1) / length;
        var dx = 1 / density;

        // If there is a single particle, show it in the middle of the component.
        if ( integralNumberParticles === 1 ) {
          dx = 0;
          offset = (startingPoint + endingPoint) / 2;
        }
        for ( var i = 0; i < integralNumberParticles; i++ ) {
          this.electrons.add( new Electron( circuitElement, i * dx + offset, this.circuit.showElectronsProperty ) );
        }
      }

      circuitElement.dirty = false;
    }
  } );
} );