// Copyright 2016, University of Colorado Boulder

/**
 * Creates Electrons in a CircuitElement when it has been created, or when an adjacent wire's length has been modified.
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

  /**
   * @param {Circuit} circuit
   * @constructor
   */
  function ElectronLayout( circuit ) {

    // @private
    this.circuit = circuit;
  }

  circuitConstructionKitCommon.register( 'ElectronLayout', ElectronLayout );

  return inherit( Object, ElectronLayout, {

    /**
     * Creates and positions electrons in the specified circuit element.
     * @param circuitElement
     * @public
     */
    layoutElectrons: function( circuitElement ) {

      if ( !circuitElement.electronLayoutDirty ) {
        return;
      }

      // Remove any electrons that were already in the branch.
      // TODO: a performance improvement could be to adjust them instead of delete/recreate. This could particularly
      // help when dragging a wire, and the electrons are continually re-layed-out.
      var particlesToRemove = this.circuit.getElectronsInCircuitElement( circuitElement );
      this.circuit.electrons.removeAll( particlesToRemove );

      // compress or expand, but fix a particle at startingPoint and endingPoint.
      var offset = CircuitConstructionKitConstants.ELECTRON_SEPARATION / 2;

      var endingPoint = circuitElement.electronPathLength - offset;
      var startingPoint = offset;
      var length = endingPoint - startingPoint;

      var numberOfParticles = Math.ceil( length / CircuitConstructionKitConstants.ELECTRON_SEPARATION );
      var density = ( numberOfParticles - 1) / length;  // TODO: why is this subtracting 1?
      var dx = 1 / density;

      // If there is a single particle, show it in the middle of the component.
      if ( numberOfParticles === 1 ) {
        dx = 0;
        offset = (startingPoint + endingPoint) / 2;
      }
      for ( var i = 0; i < numberOfParticles; i++ ) {
        this.circuit.electrons.add( new Electron( circuitElement, i * dx + offset, this.circuit.showElectronsProperty ) );
      }

      circuitElement.electronLayoutDirty = false;
    }
  } );
} );