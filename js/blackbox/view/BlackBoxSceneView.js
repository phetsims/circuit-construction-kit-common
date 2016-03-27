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
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsScreenView' );
  var ModeRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/ModeRadioButtonGroup' );
  var ComboBox = require( 'SUN/ComboBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxNode' );
  var WhiteBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/WhiteBoxNode' );
  var ScreenView = require( 'JOIST/ScreenView' );

  /**
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @constructor
   */
  function BlackBoxSceneView( blackBoxSceneModel, sceneProperty ) {
    var BlackBoxSceneView = this;
    CircuitConstructionKitBasicsScreenView.call( this, blackBoxSceneModel );

    // Add 'Investigate Circuit' and 'Build Circuit' radio buttons under the sensor toolbox
    var modeRadioButtonGroup = new ModeRadioButtonGroup( blackBoxSceneModel.modeProperty );
    this.addChild( modeRadioButtonGroup );

    var comboBoxTextOptions = {
      fontSize: 16
    };

    // Workaround for https://github.com/phetsims/sun/issues/229 which puts the ComboBox popup behind the text for
    // the warmup scene
    this.comboBoxPopupLayer = new Node();
    this.addChild( this.comboBoxPopupLayer );

    // A different ComboBox instance appears in each BlackBoxSceneView
    var comboBox = new ComboBox( [ {
      node: new Text( 'Warm-up', comboBoxTextOptions ), value: 'warmup'
    }, {
      node: new Text( 'Black Box 1', comboBoxTextOptions ), value: 'scene1'
    }, {
      node: new Text( 'Black Box 2', comboBoxTextOptions ), value: 'scene2'
    }, {
      node: new Text( 'Black Box 3', comboBoxTextOptions ), value: 'scene3'
    } ], sceneProperty, this.comboBoxPopupLayer );
    this.addChild( comboBox );

    // Layout when the screen view size changed
    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.addListener( function( layoutDimensions ) {
      modeRadioButtonGroup.top = BlackBoxSceneView.sensorToolbox.bottom + 20;
      modeRadioButtonGroup.right = BlackBoxSceneView.sensorToolbox.right;

      comboBox.centerX = -layoutDimensions.dx + layoutDimensions.width / 2;
      comboBox.top = -layoutDimensions.dy + CircuitConstructionKitBasicsConstants.layoutInset;
    } );

    var blackBoxNode = new BlackBoxNode( 160, 100, {

      // Assumes the default layout bounds are used
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      centerY: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2
    } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      blackBoxNode.visible = mode === 'investigate';
    } );

    var whiteBoxNode = new WhiteBoxNode( 160, 100, {

      // Assumes the default layout bounds are used
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      centerY: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2
    } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      whiteBoxNode.visible = mode === 'build';
    } );

    this.addChild( blackBoxNode );
    this.addChild( whiteBoxNode );

    // Workaround for https://github.com/phetsims/sun/issues/229 which puts the ComboBox popup behind the text for
    // the warmup scene
    this.comboBoxPopupLayer.moveToFront();
  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxSceneView );
} );