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

  // constants
  var inset = CircuitConstructionKitBasicsConstants.layoutInset;

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsScreenModel
   * @constructor
   */
  function IntroScreenView( circuitConstructionKitBasicsScreenModel ) {
    var introScreenView = this;
    CircuitConstructionKitBasicsScreenView.call( this, circuitConstructionKitBasicsScreenModel, { toolboxOrientation: 'horizontal' } );
    var displayOptionsPanel = new DisplayOptionsPanel( new Property( false ), new Property( false ), new Property( false ) );
    this.addChild( displayOptionsPanel );
    this.visibleBoundsProperty.link( function( visibleBounds ) {
      displayOptionsPanel.top = visibleBounds.top + inset;
      displayOptionsPanel.right = visibleBounds.right - inset;

      introScreenView.sensorToolbox.top = displayOptionsPanel.bottom + 10;
      introScreenView.sensorToolbox.right = displayOptionsPanel.right;

      introScreenView.circuitElementToolbox.mutate( {
        centerX: visibleBounds.centerX,
        bottom: visibleBounds.bottom - inset
      } );

      introScreenView.circuitElementEditContainerPanel.mutate( {
        left: visibleBounds.left + inset,
        bottom: visibleBounds.bottom - inset
      } );
    } );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, IntroScreenView );
} );