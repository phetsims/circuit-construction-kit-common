// Copyright 2015, University of Colorado Boulder

/**
 * One scene for the black box screen, which focuses on a single black box.
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
  function BlackBoxSceneModel( circuit ) {
    CircuitConstructionKitBasicsModel.call( this, {
      mode: 'investigate' // or 'build'
    }, {
      circuit: circuit
    } );

    this.modeProperty.link( function( mode ) {

      // When switching to build mode, remove all of the black box circuitry
      if ( mode === 'build' ) {
        circuit.removeBlackBoxWires();

        // TODO: store and restore the removed parts
      }
    } );
  }

  return inherit( CircuitConstructionKitBasicsModel, BlackBoxSceneModel );
} );