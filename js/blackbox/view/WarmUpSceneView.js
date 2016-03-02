// Copyright 2015, University of Colorado Boulder

/**
 * One scene focuses on one black box, and has a separate model + view because scenes are independent.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BlackBoxSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxSceneView' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );

  /**
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @constructor
   */
  function WarmUpSceneView( blackBoxSceneModel, sceneProperty ) {
    BlackBoxSceneView.call( this, blackBoxSceneModel, sceneProperty );
    var textOptions = {
      fontSize: 44
    };
    var questionText = new MultiLineText( 'What circuit element(s) are\nin the black box?', textOptions );
    var tryToText = new MultiLineText( 'Build a copy of the circuit element(s)\nin the black box', textOptions );

    this.addChild( tryToText );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      tryToText.visible = mode === 'build';
    } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      questionText.visible = mode === 'investigate';
    } );

    this.addChild( questionText );
    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.addListener( function( layoutDimensions ) {
      questionText.centerX = -layoutDimensions.dx + layoutDimensions.width / 2;
      questionText.top = -layoutDimensions.dy + layoutDimensions.height / 6;
      tryToText.centerX = -layoutDimensions.dx + layoutDimensions.width / 2;
      tryToText.bottom = -layoutDimensions.dy + layoutDimensions.height - 50;
    } );
  }

  return inherit( BlackBoxSceneView, WarmUpSceneView );
} );