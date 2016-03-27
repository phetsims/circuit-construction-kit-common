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

        // Use the same dimensions for every black box so the size doesn't indicate what could be inside
        var blackBoxWidth = 250;
        var blackBoxHeight = 250;

        if ( scene === 'warmup' ) {
          sceneViews[ scene ] = new WarmUpSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [ {
              resistance: 0,
              startVertex: 0,
              endVertex: 1,
              options: {
                interactive: false
              }
            } ],
            batteries: [],
            lightBulbs: [],
            resistors: [],
            vertices: [
              {
                x: 416,
                y: 305
              },
              {
                x: 606,
                y: 305
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene1' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 3,
                endVertex: 1
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 10,
                startVertex: 2,
                endVertex: 3
              }
            ],
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
              },
              {
                x: 451.31111111111113,
                y: 304.3777777777778
              },
              {
                x: 561.3111111111111,
                y: 304.3777777777778
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene2' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 3,
                endVertex: 1
              }
            ],
            batteries: [
              {
                voltage: 10,
                startVertex: 3,
                endVertex: 2
              }
            ],
            lightBulbs: [],
            resistors: [],
            vertices: [
              {
                x: 416,
                y: 305
              },
              {
                x: 606,
                y: 305
              },
              {
                x: 463.3925925925927,
                y: 305,
                options: {
                  attachable: false
                }
              },
              {
                x: 565.3925925925927,
                y: 305,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene3' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [ {
              resistance: 0,
              startVertex: 0,
              endVertex: 1,
              options: {
                interactive: false
              }
            } ],
            batteries: [],
            lightBulbs: [],
            resistors: [],
            vertices: [
              {
                x: 416,
                y: 305
              },
              {
                x: 606,
                y: 305
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene4' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
              wires: [
                {
                  resistance: 0,
                  startVertex: 0,
                  endVertex: 1
                },
                {
                  resistance: 0,
                  startVertex: 2,
                  endVertex: 3
                },
                {
                  resistance: 0,
                  startVertex: 4,
                  endVertex: 5
                }
              ],
              batteries: [],
              lightBulbs: [],
              resistors: [
                {
                  resistance: 10,
                  startVertex: 1,
                  endVertex: 2
                }
              ],
              vertices: [
                {
                  x: 518.8888888888889,
                  y: 255.07407407407413
                },
                {
                  x: 500.2727579139597,
                  y: 310.8613364625639
                },
                {
                  x: 598.0444444444444,
                  y: 361.26666666666677
                },
                {
                  x: 679.5703703703705,
                  y: 361.26666666666654
                },
                {
                  x: 374.77037037037036,
                  y: 357.4740740740741
                },
                {
                  x: 448.2222222222222,
                  y: 357.4740740740741
                }
              ]
            }
          ) ), blackBoxScreenModel.sceneProperty );
        }
        else {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( new Circuit() ), blackBoxScreenModel.sceneProperty );
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