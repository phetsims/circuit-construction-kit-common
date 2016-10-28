// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Contains the circuit elements, sensors, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitModel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitConstructionKitModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );

  /**
   * @constructor
   */
  function IntroSceneModel( layoutBounds, selectedSceneProperty, tandem ) {
    CircuitConstructionKitModel.call( this, tandem );

    // @public (read-only)
    this.selectedSceneProperty = selectedSceneProperty;

    // @private
    this.layoutBounds = layoutBounds;

    // set initial state (a light bulb)
    this.setInitialState();
  }

  circuitConstructionKitCommon.register( 'IntroSceneModel', IntroSceneModel );

  return inherit( CircuitConstructionKitModel, IntroSceneModel, {
    setInitialState: function() {
      // All of the intro scenes have a light bulb in the center of the screen.
      this.circuit.lightBulbs.add( LightBulb.createAtPosition( this.layoutBounds.center, this.circuit.vertexGroupTandem, {
        canBeDroppedInToolbox: false
      } ) );
    },
    reset: function() {
      CircuitConstructionKitModel.prototype.reset.call( this );

      this.setInitialState();
    }
  } );
} );