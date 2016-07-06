// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * One scene focuses on one black box, and has a separate model + view because scenes are independent.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var BlackBoxSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/BlackBoxSceneView' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {number} blackBoxWidth
   * @param {number} blackBoxHeight
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @param {Property.<Color>} backgroundColorProperty
   * @constructor
   */
  function WarmUpSceneView( blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty, backgroundColorProperty, tandem ) {
    BlackBoxSceneView.call( this, blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty, backgroundColorProperty, tandem );
    var textOptions = {
      fontSize: 34
    };

    var questionText = new MultiLineText( 'What circuit is\nin the black box?', _.extend( {
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 6
    }, textOptions ) );
    Property.multilink( [ blackBoxSceneModel.modeProperty, blackBoxSceneModel.revealingProperty ], function( mode, revealing ) {
      questionText.visible = !revealing && mode === 'investigate';
    } );

    var tryToText = new MultiLineText( 'Build a circuit that\nbehaves the same way.', _.extend( {
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 6
    }, textOptions ) );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      tryToText.moveToFront(); // So it doesn't become obscured by the partially transparent overlay
      tryToText.visible = mode === 'build';
    } );

    this.addChild( questionText );
    this.addChild( tryToText );

    // Let the circuit elements move in front of the text
    tryToText.moveToBack();
    questionText.moveToBack();
  }

  circuitConstructionKitCommon.register( 'WarmUpSceneView', WarmUpSceneView );
  return inherit( BlackBoxSceneView, WarmUpSceneView );
} );