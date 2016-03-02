// Copyright 2015, University of Colorado Boulder

/**
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
  function BlackBoxSceneModel() {
    CircuitConstructionKitBasicsModel.call( this, {
      mode: 'investigate'
    } );
  }

  return inherit( CircuitConstructionKitBasicsModel, BlackBoxSceneModel );
} );