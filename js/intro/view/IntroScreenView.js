// Copyright 2015-2016, University of Colorado Boulder

/**
 * Shows the selected scene, and relays the visible bounds to each IntroSceneNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroSceneNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/view/IntroSceneNode' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var IntroSceneModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/model/IntroSceneModel' );
  var SceneSelectionRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/view/SceneSelectionRadioButtonGroup' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );

  // constants
  var inset = CircuitConstructionKitBasicsConstants.layoutInset;

  /**
   * @param {CircuitConstructionKitBasicsModel} introScreenModel
   * @constructor
   */
  function IntroScreenView( introScreenModel ) {
    var introScreenView = this;
    ScreenView.call( this );

    var sceneNodes = {};

    var sceneSelectionRadioButtonGroup = new SceneSelectionRadioButtonGroup(
      introScreenModel.selectedSceneProperty
    );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        introScreenModel.reset();

        _.values( sceneNodes ).forEach( function( sceneNode ) {
          sceneNode.reset();
          sceneNode.circuitConstructionKitBasicsModel.reset();
        } );
      }
    } );
    this.addChild( resetAllButton );

    introScreenModel.selectedSceneProperty.link( function( selectedScene ) {
      if ( !sceneNodes[ selectedScene ] ) {
        var options = {
          0: {
            numberOfLeftBatteriesInToolbox: 0,
            numberOfRightBatteriesInToolbox: 1,
            numberOfWiresInToolbox: 4,
            numberOfLightBulbsInToolbox: 0,
            numberOfResistorsInToolbox: 0
          },
          1: {
            numberOfLeftBatteriesInToolbox: 1,
            numberOfRightBatteriesInToolbox: 1,
            numberOfWiresInToolbox: 4,
            numberOfLightBulbsInToolbox: 0,
            numberOfResistorsInToolbox: 0
          },
          2: {
            numberOfLeftBatteriesInToolbox: 1,
            numberOfRightBatteriesInToolbox: 1,
            numberOfWiresInToolbox: 4,
            numberOfLightBulbsInToolbox: 0,
            numberOfResistorsInToolbox: 0
          }
        }[ selectedScene ];
        var sceneNode = new IntroSceneNode( new IntroSceneModel( introScreenView.layoutBounds, introScreenModel.selectedSceneProperty ), options );
        sceneNode.visibleBoundsProperty.set( introScreenView.visibleBoundsProperty.value );
        sceneNodes[ selectedScene ] = sceneNode;
      }

      // scene selection buttons go in back so that circuit elements may go in front
      introScreenView.children = [
        resetAllButton,
        sceneSelectionRadioButtonGroup,
        sceneNodes[ selectedScene ]
      ];
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      _.values( sceneNodes ).forEach( function( sceneNode ) {
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

  circuitConstructionKitBasics.register( 'IntroScreenView', IntroScreenView );
  
  return inherit( ScreenView, IntroScreenView );
} );