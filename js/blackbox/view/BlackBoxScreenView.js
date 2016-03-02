// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsScreenView' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsModel
   * @constructor
   */
  function BlackBoxScreenView( circuitConstructionKitBasicsScreenModel ) {
    CircuitConstructionKitBasicsScreenView.call( this, circuitConstructionKitBasicsScreenModel );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxScreenView );
} );