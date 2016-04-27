// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsScreenView' );
  var Property = require( 'AXON/Property' );
  var DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/DisplayOptionsPanel' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsScreenModel
   * @constructor
   */
  function IntroScreenView( circuitConstructionKitBasicsScreenModel ) {
    var introScreenView = this;
    CircuitConstructionKitBasicsScreenView.call( this, circuitConstructionKitBasicsScreenModel );
    var displayOptionsPanel = new DisplayOptionsPanel( new Property( false ), new Property( false ), new Property( false ) );
    this.addChild( displayOptionsPanel );
    this.visibleBoundsProperty.link( function( visibleBounds ) {
      displayOptionsPanel.top = visibleBounds.top + CircuitConstructionKitBasicsConstants.layoutInset;
      displayOptionsPanel.right = visibleBounds.right - CircuitConstructionKitBasicsConstants.layoutInset;

      introScreenView.sensorToolbox.top = displayOptionsPanel.bottom + 10;
      introScreenView.sensorToolbox.right = displayOptionsPanel.right;
    } );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, IntroScreenView );
} );