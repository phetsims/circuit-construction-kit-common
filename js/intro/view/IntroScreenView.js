// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Shows the selected scene, and relays the visible bounds to each IntroSceneNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroSceneNode = require( 'CIRCUIT_CONSTRUCTION_KIT/intro/view/IntroSceneNode' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var IntroSceneModel = require( 'CIRCUIT_CONSTRUCTION_KIT/intro/model/IntroSceneModel' );
  var SceneSelectionRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT/intro/view/SceneSelectionRadioButtonGroup' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );

  // constants
  var inset = CircuitConstructionKitConstants.layoutInset;

  /**
   * @param {CircuitConstructionKitModel} introScreenModel
   * @constructor
   */
  function IntroScreenView( introScreenModel ) {
    var introScreenView = this;
    this.introScreenModel = introScreenModel;
    ScreenView.call( this );

    this.sceneNodes = {};

    var sceneSelectionRadioButtonGroup = new SceneSelectionRadioButtonGroup(
      introScreenModel.selectedSceneProperty
    );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        introScreenModel.reset();

        _.values( introScreenView.sceneNodes ).forEach( function( sceneNode ) {
          sceneNode.reset();
          sceneNode.circuitConstructionKitModel.reset();
        } );
      }
    } );
    this.addChild( resetAllButton );

    introScreenModel.selectedSceneProperty.link( function( selectedScene ) {
      if ( !introScreenView.sceneNodes[ selectedScene ] ) {
        var options = {
          0: {
            numberOfLeftBatteriesInToolbox: 0,
            numberOfRightBatteriesInToolbox: 1,
            numberOfWiresInToolbox: 4,
            numberOfLightBulbsInToolbox: 0,
            numberOfResistorsInToolbox: 0,
            numberOfSwitchesInToolbox: 0
          },
          1: {
            numberOfLeftBatteriesInToolbox: 1,
            numberOfRightBatteriesInToolbox: 1,
            numberOfWiresInToolbox: 4,
            numberOfLightBulbsInToolbox: 0,
            numberOfResistorsInToolbox: 0,
            numberOfSwitchesInToolbox: 0
          },
          2: {
            numberOfLeftBatteriesInToolbox: 1,
            numberOfRightBatteriesInToolbox: 1,
            numberOfWiresInToolbox: 4,
            numberOfLightBulbsInToolbox: 0,
            numberOfResistorsInToolbox: 0,
            numberOfSwitchesInToolbox: 1
          }
        }[ selectedScene ];
        var sceneNode = new IntroSceneNode( new IntroSceneModel( introScreenView.layoutBounds, introScreenModel.selectedSceneProperty ), options );
        sceneNode.visibleBoundsProperty.set( introScreenView.visibleBoundsProperty.value );
        introScreenView.sceneNodes[ selectedScene ] = sceneNode;
      }

      // scene selection buttons go in back so that circuit elements may go in front
      introScreenView.children = [
        resetAllButton,
        sceneSelectionRadioButtonGroup,
        introScreenView.sceneNodes[ selectedScene ]
      ];
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      _.values( introScreenView.sceneNodes ).forEach( function( sceneNode ) {
        sceneNode.visibleBoundsProperty.set( visibleBounds );
      } );

      sceneSelectionRadioButtonGroup.mutate( {
        left: visibleBounds.left + inset,
        top: visibleBounds.top + inset
      } );

      // Float the resetAllButton to the bottom right
      resetAllButton.mutate( {
        right: visibleBounds.right - inset,
        bottom: visibleBounds.bottom - inset
      } );
    } );
  }

  circuitConstructionKit.register( 'IntroScreenView', IntroScreenView );

  return inherit( ScreenView, IntroScreenView, {
    step: function( dt ) {
      this.sceneNodes[ this.introScreenModel.selectedScene ].circuitConstructionKitScreenModel.step( dt );
    }
  } );
} );