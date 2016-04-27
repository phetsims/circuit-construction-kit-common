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

  /**
   * @constructor
   */
  function IntroSceneModel( selectedSceneProperty ) {
    CircuitConstructionKitBasicsModel.call( this );

    // @public (read-only)
    this.selectedSceneProperty = selectedSceneProperty;
  }

  return inherit( CircuitConstructionKitBasicsModel, IntroSceneModel );
} );