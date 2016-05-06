// Copyright 2015-2016, University of Colorado Boulder

/**
 * One scene focuses on one black box, and has a separate model + view because scenes are independent.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var BlackBoxSceneView = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/BlackBoxSceneView' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var ScreenView = require( 'JOIST/ScreenView' );

  /**
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @constructor
   */
  function WarmUpSceneView( blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty ) {
    BlackBoxSceneView.call( this, blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty );
    var textOptions = {
      fontSize: 34
    };

    var tryToText = new MultiLineText( 'Build a circuit that\nbehaves the same way.', _.extend( {
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      top: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 6
    }, textOptions ) );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      tryToText.moveToFront(); // So it doesn't become obscured by the partially transparent overlay
      tryToText.visible = mode === 'build';
    } );

    this.addChild( tryToText );

    // Let the circuit elements move in front of the text
    tryToText.moveToBack();
  }

  circuitConstructionKit.register( 'WarmUpSceneView', WarmUpSceneView );
  return inherit( BlackBoxSceneView, WarmUpSceneView );
} );