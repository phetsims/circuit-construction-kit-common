// Copyright 2015-2016, University of Colorado Boulder

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
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 451.31111111111113,
                y: 304.3777777777778,
                options: {
                  attachable: false
                }
              },
              {
                x: 561.3111111111111,
                y: 304.3777777777778,
                options: {
                  attachable: false
                }
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
                x: 381,
                y: 305
              },
              {
                x: 641,
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
        else if ( scene === 'scene2' ) {
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
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene3' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 2,
                endVertex: 3
              },
              {
                resistance: 0,
                startVertex: 4,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 5
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 10,
                startVertex: 3,
                endVertex: 4
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 494.73089897821814,
                y: 243.01287667140764,
                options: {
                  attachable: false
                }
              },
              {
                x: 575.7047913446678,
                y: 317.4657393096343,
                options: {
                  attachable: false
                }
              },
              {
                x: 474.16074188562595,
                y: 304.80422462648113,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene4' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 2,
                endVertex: 3
              },
              {
                resistance: 0,
                startVertex: 4,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 5
              },
              {
                resistance: 0,
                startVertex: 5,
                endVertex: 4
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 10,
                startVertex: 3,
                endVertex: 4
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 494.73089897821814,
                y: 243.01287667140764,
                options: {
                  attachable: false
                }
              },
              {
                x: 575.7047913446678,
                y: 317.4657393096343,
                options: {
                  attachable: false
                }
              },
              {
                x: 474.16074188562595,
                y: 304.80422462648113,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene5' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 2,
                endVertex: 3
              },
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 4
              },
              {
                resistance: 0,
                startVertex: 5,
                endVertex: 1
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 10,
                startVertex: 3,
                endVertex: 5
              },
              {
                resistance: 15,
                startVertex: 4,
                endVertex: 5
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 466.7932305597578,
                y: 246.6736324433821,
                options: {
                  attachable: false
                }
              },
              {
                x: 436.2563281508843,
                y: 315.1157323880298,
                options: {
                  attachable: false
                }
              },
              {
                x: 545.9709724238027,
                y: 323.0338655055636,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene6' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 5
              },
              {
                resistance: 0,
                startVertex: 3,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 4,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 6,
                endVertex: 7
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 10,
                startVertex: 3,
                endVertex: 4
              },
              {
                resistance: 25,
                startVertex: 5,
                endVertex: 6
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 491.92597968069657,
                y: 250.20948234155776,
                options: {
                  attachable: false
                }
              },
              {
                x: 580.837550793385,
                y: 314.9762371025718,
                options: {
                  attachable: false
                }
              },
              {
                x: 448.30478955007254,
                y: 306.68553459119494,
                options: {
                  attachable: false
                }
              },
              {
                x: 534.2197071006653,
                y: 375.37779719969285,
                options: {
                  attachable: false
                }
              },
              {
                x: 516.6705370101597,
                y: 435.9859700048379
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene7' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 6
              },
              {
                resistance: 0,
                startVertex: 5,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 3,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 5,
                endVertex: 4
              },
              {
                resistance: 0,
                startVertex: 6,
                endVertex: 5
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 40,
                startVertex: 5,
                endVertex: 3
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 598.67209360906,
                y: 310.5176013986531,
                options: {
                  attachable: false
                }
              },
              {
                x: 516.6705370101597,
                y: 435.9859700048379
              },
              {
                x: 509.7605224963715,
                y: 245.75084663763903,
                options: {
                  attachable: false
                }
              },
              {
                x: 448.30478955007254,
                y: 306.68553459119494,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene8' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 4
              },
              {
                resistance: 0,
                startVertex: 5,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 7,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 6,
                endVertex: 3
              },
              {
                resistance: 0,
                startVertex: 6,
                endVertex: 7
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 15,
                startVertex: 5,
                endVertex: 7
              },
              {
                resistance: 10,
                startVertex: 4,
                endVertex: 5
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 509.23947750362845,
                y: 437.4721819061441
              },
              {
                x: 429.7844303895079,
                y: 301.9537616627625,
                options: {
                  attachable: false
                }
              },
              {
                x: 509.76052249637144,
                y: 226.43009192065796,
                options: {
                  attachable: false
                }
              },
              {
                x: 511.2467343976777,
                y: 312.6303821964199,
                options: {
                  attachable: false
                }
              },
              {
                x: 598.6720936090605,
                y: 291.196846681672,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene9' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 5
              },
              {
                resistance: 0,
                startVertex: 4,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 7,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 6,
                endVertex: 3
              }
            ],
            batteries: [
              {
                voltage: 10,
                startVertex: 4,
                endVertex: 5
              }
            ],
            lightBulbs: [],
            resistors: [
              {
                resistance: 40,
                startVertex: 4,
                endVertex: 7
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 509.23947750362845,
                y: 437.4721819061441
              },
              {
                x: 509.76052249637144,
                y: 226.43009192065796,
                options: {
                  attachable: false
                }
              },
              {
                x: 429.54911989720756,
                y: 289.4390666232742,
                options: {
                  attachable: false
                }
              },
              {
                x: 511.2467343976777,
                y: 312.6303821964199,
                options: {
                  attachable: false
                }
              },
              {
                x: 598.6720936090605,
                y: 291.196846681672,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
        }
        else if ( scene === 'scene10' ) {
          sceneViews[ scene ] = new BlackBoxSceneView( blackBoxWidth, blackBoxHeight, new BlackBoxSceneModel( Circuit.fromStateObject( {
            wires: [
              {
                resistance: 0,
                startVertex: 0,
                endVertex: 4
              },
              {
                resistance: 0,
                startVertex: 5,
                endVertex: 2
              },
              {
                resistance: 0,
                startVertex: 7,
                endVertex: 1
              },
              {
                resistance: 0,
                startVertex: 6,
                endVertex: 3
              },
              {
                resistance: 0,
                startVertex: 7,
                endVertex: 8
              }
            ],
            batteries: [],
            lightBulbs: [],
            resistors: [
              {
                resistance: 5,
                startVertex: 4,
                endVertex: 5
              },
              {
                resistance: 5,
                startVertex: 4,
                endVertex: 6
              },
              {
                resistance: 10,
                startVertex: 5,
                endVertex: 7
              },
              {
                resistance: 10,
                startVertex: 6,
                endVertex: 8
              }
            ],
            vertices: [
              {
                x: 381,
                y: 305
              },
              {
                x: 641,
                y: 305
              },
              {
                x: 508.6893353941268,
                y: 178.18907779495106
              },
              {
                x: 509.23947750362845,
                y: 437.4721819061441
              },
              {
                x: 429.47373111984234,
                y: 306.0820194162099,
                options: {
                  attachable: false
                }
              },
              {
                x: 509.76052249637144,
                y: 230.8887276245767,
                options: {
                  attachable: false
                }
              },
              {
                x: 515.2404740840386,
                y: 374.95919852013003,
                options: {
                  attachable: false
                }
              },
              {
                x: 592.4940785388161,
                y: 303.38120105852477,
                options: {
                  attachable: false
                }
              },
              {
                x: 608.3992218798088,
                y: 316.46605610903987,
                options: {
                  attachable: false
                }
              }
            ]
          } ) ), blackBoxScreenModel.sceneProperty );
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

  return inherit( ScreenView, BlackBoxScreenView );
} );