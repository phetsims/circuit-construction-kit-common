// Copyright 2015-2016, University of Colorado Boulder

/**
 * Contains the circuit elements, sensors, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CircuitConstructionKitBasicsModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/CircuitConstructionKitBasicsModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );

  /**
   * @constructor
   */
  function IntroSceneModel( layoutBounds, selectedSceneProperty ) {
    CircuitConstructionKitBasicsModel.call( this );

    // @public (read-only)
    this.selectedSceneProperty = selectedSceneProperty;

    // All of the intro scenes have a light bulb in the center of the screen.
    this.circuit.lightBulbs.add( LightBulb.createAtPosition( layoutBounds.center, {
      canBeDroppedInToolbox: false
    } ) );
  }

  return inherit( CircuitConstructionKitBasicsModel, IntroSceneModel );
} );