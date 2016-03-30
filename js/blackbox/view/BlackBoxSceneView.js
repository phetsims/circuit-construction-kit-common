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
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @constructor
   */
  function BlackBoxSceneView( blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty ) {
    var blackBoxSceneView = this;
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
    var elements = [ {
      node: new Text( 'Warm-up', comboBoxTextOptions ), value: 'warmup'
    } ];
    for ( var i = 1; i <= 11; i++ ) {
      elements.push( {
        node: new Text( 'Black Box ' + i, comboBoxTextOptions ), value: 'scene' + i
      } );
    }
    var comboBox = new ComboBox( elements, sceneProperty, this.comboBoxPopupLayer );
    this.addChild( comboBox );

    // Layout when the screen view size changed
    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.addListener( function( layoutDimensions ) {
      modeRadioButtonGroup.top = blackBoxSceneView.sensorToolbox.bottom + 20;
      modeRadioButtonGroup.right = blackBoxSceneView.sensorToolbox.right;

      comboBox.centerX = -layoutDimensions.dx + layoutDimensions.width / 2;
      comboBox.top = -layoutDimensions.dy + CircuitConstructionKitBasicsConstants.layoutInset;
    } );

    var blackBoxNode = new BlackBoxNode( blackBoxWidth, blackBoxHeight, {

      // Assumes the default layout bounds are used
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      centerY: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2
    } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      blackBoxNode.visible = mode === 'investigate';
    } );

    var whiteBoxNode = new WhiteBoxNode( blackBoxWidth, blackBoxHeight, {

      // Assumes the default layout bounds are used
      centerX: ScreenView.DEFAULT_LAYOUT_BOUNDS.width / 2,
      centerY: ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2
    } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      whiteBoxNode.visible = mode === 'build';
    } );

    this.addChild( blackBoxNode );
    this.addChild( whiteBoxNode );

    var screenInset = 1000;
    var boxInset = 20;
    var b = ScreenView.DEFAULT_LAYOUT_BOUNDS;
    var w = whiteBoxNode.bounds;
    var shape = new Shape()
      .moveTo( b.minX - screenInset, b.minY - screenInset )
      .lineTo( b.maxX + screenInset, b.minY - screenInset )
      .lineTo( b.maxX + screenInset, b.maxY + screenInset )
      .lineTo( b.minX - screenInset, b.maxY + screenInset )
      .lineTo( b.minX - screenInset, b.minX + screenInset )

      // Move inside and move the opposite direction to do a cutout
      // TODO: fit to the curves for the rectangular box
      .moveTo( w.minX - boxInset, w.minY - boxInset )
      .lineTo( w.minX - boxInset, w.maxY + boxInset )
      .lineTo( w.maxX + boxInset, w.maxY + boxInset )
      .lineTo( w.maxX + boxInset, w.minY - boxInset )
      .lineTo( w.minX - boxInset, w.minY - boxInset );
    var transparencyOverlay = new Path( shape, { fill: 'white', opacity: 0.5 } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      var isBuildBode = mode === 'build';
      if ( isBuildBode ) {
        transparencyOverlay.moveToFront();
        blackBoxSceneView.circuitElementToolbox.moveToFront();
      }
      transparencyOverlay.visible = isBuildBode;
    } );
    this.circuitNode.mainLayer.addChild( transparencyOverlay );

    // Workaround for https://github.com/phetsims/sun/issues/229 which puts the ComboBox popup behind the text for
    // the warmup scene
    this.comboBoxPopupLayer.moveToFront();
  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxSceneView );
} );