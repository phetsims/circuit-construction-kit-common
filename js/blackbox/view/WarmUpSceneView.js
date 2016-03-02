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
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxNode' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var ScreenView = require( 'JOIST/ScreenView' );

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

    // TODO: Maybe put the text in front with a partially transparent background, then fade it to the back?
    // TODO: It got overlapped by many things after switching to 'build'
    var questionText = new MultiLineText( 'What circuit element(s) are\nin the black box?', _.extend( {
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 6
    }, textOptions ) );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      questionText.visible = mode === 'investigate';
    } );

    var tryToText = new MultiLineText( 'Build a copy of the circuit element(s)\nin the black box', _.extend( {
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height * 4 / 6
    }, textOptions ) );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      tryToText.visible = mode === 'build';
    } );

    this.addChild( questionText );
    this.addChild( tryToText );

    // Let the circuit elements move in front of the text
    tryToText.moveToBack();
    questionText.moveToBack();

    this.addChild( new BlackBoxNode( 160, 100, {

      // Assumes the default layout bounds are used
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      centerY: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2
    } ) );

    // Workaround for https://github.com/phetsims/sun/issues/229 which puts the ComboBox popup behind the text for
    // the warmup scene
    this.comboBoxPopupLayer.moveToFront();
  }

  return inherit( BlackBoxSceneView, WarmUpSceneView );
} );