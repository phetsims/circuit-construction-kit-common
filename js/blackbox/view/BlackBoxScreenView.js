// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * This screen view creates and delegates to the scene views, it does not show anything that is not in a scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var BlackBoxSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/BlackBoxSceneView' );
  var BlackBoxSceneModel = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/model/BlackBoxSceneModel' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var WarmUpSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/WarmUpSceneView' );
  var CircuitStruct = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitStruct' );
  var ChallengeSet = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/model/ChallengeSet' );

  /**
   * @param {BlackBoxScreenModel} blackBoxScreenModel
   * @param {Property.<Color>} backgroundColorProperty
   * @constructor
   */
  function BlackBoxScreenView( blackBoxScreenModel, backgroundColorProperty, tandem ) {
    ScreenView.call( this );
    var blackBoxScreenView = this;
    var sceneViews = {}; // Populated lazily, key = scene name
    blackBoxScreenModel.sceneProperty.link( function( scene ) {

      // Create the scene if it did not already exist
      if ( !sceneViews[ scene ] ) {

        // Use the same dimensions for every black box so the size doesn't indicate what could be inside
        var blackBoxWidth = 250;
        var blackBoxHeight = 250;

        if ( scene === 'warmup' ) {
          sceneViews[ scene ] = new WarmUpSceneView(
            blackBoxWidth,
            blackBoxHeight,
            new BlackBoxSceneModel( CircuitStruct.fromStateObject( ChallengeSet.warmupCircuitStateObject ) ),
            blackBoxScreenModel.sceneProperty,
            backgroundColorProperty,
            tandem.createTandem( scene + 'SceneView' )
          );
        }
        else if ( scene.indexOf( 'scene' ) === 0 ) {
          var index = parseInt( scene.substring( 'scene'.length ), 10 );
          sceneViews[ scene ] = new BlackBoxSceneView(
            blackBoxWidth,
            blackBoxHeight,
            new BlackBoxSceneModel( CircuitStruct.fromStateObject( ChallengeSet.challengeArray[ index ] ) ),
            blackBoxScreenModel.sceneProperty,
            backgroundColorProperty,
            tandem.createTandem( scene + 'SceneView' )
          );
        }
        else {
          assert && assert( false, 'no model found' );
        }
      }

      // Update layout when the scene changes
      blackBoxScreenView.updateAllSceneLayouts && blackBoxScreenView.updateAllSceneLayouts();

      // Show the selected scene
      blackBoxScreenView.children = [ sceneViews[ scene ] ];
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      blackBoxScreenView.updateAllSceneLayouts = function() {
        _.keys( sceneViews ).forEach( function( key ) {
          sceneViews[ key ].visibleBoundsProperty.set( visibleBounds.copy() );
        } );
      };
      blackBoxScreenView.updateAllSceneLayouts();
    } );
  }

  circuitConstructionKit.register( 'BlackBoxScreenView', BlackBoxScreenView );

  return inherit( ScreenView, BlackBoxScreenView );
} );