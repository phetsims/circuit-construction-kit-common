// Copyright 2015-2016, University of Colorado Boulder

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
  var ChallengeSet = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/model/ChallengeSet' );
  var ModeRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/ModeRadioButtonGroup' );
  var ComboBox = require( 'SUN/ComboBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxNode' );
  var WhiteBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/WhiteBoxNode' );
  var RevealButton = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/RevealButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   * @param blackBoxWidth
   * @param blackBoxHeight
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

    var revealButton = new RevealButton( blackBoxSceneModel.revealingProperty, blackBoxSceneModel.isRevealEnabledProperty );
    this.addChild( revealButton );

    var comboBoxTextOptions = {
      fontSize: 16
    };

    // A different ComboBox instance appears in each BlackBoxSceneView
    var elements = [ {
      node: new Text( 'Warm-up', comboBoxTextOptions ), value: 'warmup'
    } ];
    for ( var i = 0; i < ChallengeSet.challengeArray.length; i++ ) {
      elements.push( {
        node: new Text( 'Black Box ' + (i + 1), comboBoxTextOptions ), value: 'scene' + i
      } );
    }
    var comboBox = new ComboBox( elements, sceneProperty, this );
    this.addChild( comboBox );

    // Layout when the screen view size changed
    this.visibleBoundsProperty.link( function( visibleBounds ) {
      modeRadioButtonGroup.top = blackBoxSceneView.sensorToolbox.bottom + 20;
      modeRadioButtonGroup.right = blackBoxSceneView.sensorToolbox.right;

      revealButton.top = modeRadioButtonGroup.bottom + 10;
      revealButton.right = modeRadioButtonGroup.right;

      comboBox.centerX = visibleBounds.centerX;
      comboBox.top = visibleBounds.top + CircuitConstructionKitBasicsConstants.layoutInset;
    } );

    var blackBoxNode = new BlackBoxNode( blackBoxWidth, blackBoxHeight, {

      // Assumes the default layout bounds are used
      center: ScreenView.DEFAULT_LAYOUT_BOUNDS.center
    } );
    blackBoxSceneModel.revealingProperty.link( function( revealing ) {
      blackBoxNode.opacity = revealing ? 0.2 : 1.0;
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

    // Interleave the black/white box node in the nodes, so things may go in front of it.
    this.circuitNode.mainLayer.addChild( blackBoxNode );
    this.circuitNode.mainLayer.addChild( whiteBoxNode );

    var screenInset = 1000;
    var b = ScreenView.DEFAULT_LAYOUT_BOUNDS;
    var w = whiteBoxNode.bounds;
    var shape = new Shape()
      .moveTo( b.minX - screenInset, b.minY - screenInset )
      .lineTo( b.maxX + screenInset, b.minY - screenInset )
      .lineTo( b.maxX + screenInset, b.maxY + screenInset )
      .lineTo( b.minX - screenInset, b.maxY + screenInset )
      .lineTo( b.minX - screenInset, b.minX + screenInset )

      // Move inside and move the opposite direction to do a cutout
      .moveTo( w.minX, w.minY )
      .lineTo( w.minX, w.maxY )
      .lineTo( w.maxX, w.maxY )
      .lineTo( w.maxX, w.minY )
      .lineTo( w.minX, w.minY );
    var transparencyOverlay = new Path( shape, { fill: 'white', opacity: 0.5 } );
    blackBoxSceneModel.modeProperty.link( function( mode ) {
      var isBuildBode = mode === 'build';
      if ( isBuildBode ) {
        transparencyOverlay.moveToFront();
        blackBoxSceneView.circuitElementToolbox.moveToFront();
      }
      transparencyOverlay.visible = isBuildBode;
      blackBoxNode.moveToFront();
      whiteBoxNode.moveToFront();
    } );
    this.circuitNode.mainLayer.addChild( transparencyOverlay );

    // When reset, move the boxes in front of the black box circuit elements
    this.resetBlackBoxSceneView = function() {
      blackBoxNode.moveToFront();
      whiteBoxNode.moveToFront();
    };

  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxSceneView, {
    reset: function() {
      CircuitConstructionKitBasicsScreenView.prototype.reset.call( this );
      this.resetBlackBoxSceneView();
    }
  } );
} );