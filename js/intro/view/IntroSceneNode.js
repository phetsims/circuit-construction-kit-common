// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Node for a single scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitConstructionKitScreenView' );
  var Property = require( 'AXON/Property' );
  var DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/DisplayOptionsPanel' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // constants
  var inset = CircuitConstructionKitConstants.layoutInset;

  /**
   * @param {CircuitConstructionKitModel} circuitConstructionKitScreenModel
   * @param {Object} [options]
   * @constructor
   */
  function IntroSceneNode( circuitConstructionKitScreenModel, tandem, options ) {
    this.circuitConstructionKitScreenModel = circuitConstructionKitScreenModel;
    var self = this;
    options = _.extend( {
      numberOfRightBatteriesInToolbox: 1,
      numberOfLeftBatteriesInToolbox: 0,
      numberOfWiresInToolbox: 4,
      numberOfLightBulbsInToolbox: 0,
      numberOfResistorsInToolbox: 0,
      numberOfSwitchesInToolbox: 0
    }, options );
    CircuitConstructionKitScreenView.call( this, circuitConstructionKitScreenModel, tandem, {
      toolboxOrientation: 'horizontal',
      numberOfRightBatteriesInToolbox: options.numberOfRightBatteriesInToolbox,
      numberOfLeftBatteriesInToolbox: options.numberOfLeftBatteriesInToolbox,
      numberOfWiresInToolbox: options.numberOfWiresInToolbox,
      numberOfLightBulbsInToolbox: options.numberOfLightBulbsInToolbox,
      numberOfResistorsInToolbox: options.numberOfResistorsInToolbox,
      numberOfSwitchesInToolbox: options.numberOfSwitchesInToolbox,
      getToolboxPosition: function( visibleBounds ) {
        return {
          centerX: visibleBounds.centerX,
          bottom: visibleBounds.bottom - inset
        };
      },
      getCircuitEditPanelLayoutPosition: function( visibleBounds ) {
        return {
          left: visibleBounds.left + inset,
          bottom: visibleBounds.bottom - inset
        };
      }
    } );
    var displayOptionsPanel = new DisplayOptionsPanel( new Property( false ), new Property( false ), new Property( false ) );
    this.addChild( displayOptionsPanel );
    displayOptionsPanel.moveToBack(); // Move behind elements added in the super, such as the sensors and circuit
    this.moveBackgroundToBack();

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      displayOptionsPanel.top = visibleBounds.top + inset;
      displayOptionsPanel.right = visibleBounds.right - inset;

      self.sensorToolbox.top = displayOptionsPanel.bottom + 10;
      self.sensorToolbox.right = displayOptionsPanel.right;

      self.circuitElementToolbox.mutate( {
        centerX: visibleBounds.centerX,
        bottom: visibleBounds.bottom - inset
      } );

      self.circuitElementEditContainerPanel.mutate( {
        left: visibleBounds.left + inset,
        bottom: visibleBounds.bottom - inset
      } );
    } );
  }

  circuitConstructionKitCommon.register( 'IntroSceneNode', IntroSceneNode );

  return inherit( CircuitConstructionKitScreenView, IntroSceneNode );
} );