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
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var BlackBoxSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/BlackBoxSceneView' );
  var BlackBoxSceneModel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/model/BlackBoxSceneModel' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var WarmUpSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/WarmUpSceneView' );
  var CircuitStruct = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitStruct' );
  var ChallengeSet = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/model/ChallengeSet' );

  /**
   * @param {BlackBoxScreenModel} blackBoxScreenModel
   * @constructor
   */
  function BlackBoxScreenView( blackBoxScreenModel, tandem ) {
    ScreenView.call( this );
    var self = this;
    this.blackBoxScreenModel = blackBoxScreenModel;

    var sceneViews = {}; // Populated lazily, key = scene name
    this.sceneViews = sceneViews;
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
            new BlackBoxSceneModel( CircuitStruct.fromStateObject( ChallengeSet.warmupCircuitStateObject ), tandem.createTandem( scene + 'Model' ) ),
            blackBoxScreenModel.sceneProperty,
            tandem.createTandem( scene + 'SceneView' )
          );
        }
        else if ( scene.indexOf( 'scene' ) === 0 ) {
          var index = parseInt( scene.substring( 'scene'.length ), 10 );
          sceneViews[ scene ] = new BlackBoxSceneView(
            blackBoxWidth,
            blackBoxHeight,
            new BlackBoxSceneModel( CircuitStruct.fromStateObject( ChallengeSet.challengeArray[ index ] ), tandem.createTandem( scene + 'Model' ) ),
            blackBoxScreenModel.sceneProperty,
            tandem.createTandem( scene + 'SceneView' )
          );
        }
        else {
          assert && assert( false, 'no model found' );
        }
      }

      // Update layout when the scene changes
      self.updateAllSceneLayouts && self.updateAllSceneLayouts();

      // Show the selected scene
      self.children = [ sceneViews[ scene ] ];
    } );

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      self.updateAllSceneLayouts = function() {
        _.keys( sceneViews ).forEach( function( key ) {
          sceneViews[ key ].visibleBoundsProperty.set( visibleBounds.copy() );
        } );
      };
      self.updateAllSceneLayouts();
    } );
  }

  circuitConstructionKitCommon.register( 'BlackBoxScreenView', BlackBoxScreenView );

  return inherit( ScreenView, BlackBoxScreenView, {
    step: function( dt ) {
      this.sceneViews[ this.blackBoxScreenModel.scene ].circuitConstructionKitModel.step( dt );
    }
  } );
} );