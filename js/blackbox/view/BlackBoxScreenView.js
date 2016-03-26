// Copyright 2015, University of Colorado Boulder

/**
 * This screen view creates and delegates to the scene views, it does not show anything that is not in a scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BlackBoxSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxSceneView' );
  var BlackBoxSceneModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/model/BlackBoxSceneModel' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var WarmUpSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/WarmUpSceneView' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Circuit' );

  /**
   * @param {BlackBoxScreenModel} blackBoxScreenModel
   * @constructor
   */
  function BlackBoxScreenView( blackBoxScreenModel ) {
    ScreenView.call( this );
    var blackBoxScreenView = this;
    var sceneViews = {}; // Populated lazily, key = scene name
    blackBoxScreenModel.sceneProperty.link( function( scene ) {

      // Create the scene if it did not already exist
      if ( !sceneViews[ scene ] ) {
        if ( scene === 'warmup' ) {
          var trueBlackBoxCircuit = Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 1
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [],
            vertices: [
              {
                x: 416,
                y: 305,
                options: {
                  draggable: false
                }
              },
              {
                x: 606,
                y: 305,
                options: {
                  draggable: false
                }
              }
            ]
          } );
          sceneViews[ scene ] = new WarmUpSceneView( new BlackBoxSceneModel( trueBlackBoxCircuit ), blackBoxScreenModel.sceneProperty );
        }
        else {
          sceneViews[ scene ] = new BlackBoxSceneView( new BlackBoxSceneModel( new Circuit() ), blackBoxScreenModel.sceneProperty );
        }
      }

      // Update layout when the scene changes
      blackBoxScreenView.updateAllSceneLayouts && blackBoxScreenView.updateAllSceneLayouts();

      // Show the selected scene
      blackBoxScreenView.children = [ sceneViews[ scene ] ];
    } );

    // Forward methods to the scene so they can update their layouts too
    this.events.on( 'layoutFinished', function( dx, dy, width, height, scale ) {

      // Store layout closure so that layout can be updated when scenes change
      blackBoxScreenView.updateAllSceneLayouts = function() {
        _.keys( sceneViews ).forEach( function( key ) {
          sceneViews[ key ].events.trigger( 'layoutFinished', dx, dy, width, height, scale );
        } );
      };
      blackBoxScreenView.updateAllSceneLayouts();
    } );
  }

  return inherit( ScreenView, BlackBoxScreenView );
} );