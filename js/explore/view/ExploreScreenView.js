// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitConstructionKitScreenView' );

  /**
   * @param {CircuitConstructionKitModel} circuitConstructionKitScreenModel
   * @constructor
   */
  function ExploreScreenView( circuitConstructionKitScreenModel, tandem ) {
    CircuitConstructionKitScreenView.call( this, circuitConstructionKitScreenModel, tandem, {
      numberOfLeftBatteriesInToolbox: 0,
      toolboxOrientation: 'vertical',
      showResetAllButton: true
    } );
  }

  circuitConstructionKit.register( 'ExploreScreenView', ExploreScreenView );

  return inherit( CircuitConstructionKitScreenView, ExploreScreenView );
} );