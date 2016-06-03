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
  var CircuitConstructionKitScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitConstructionKitScreenView' );
  var ChallengeSet = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/model/ChallengeSet' );
  var ModeRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/ModeRadioButtonGroup' );
  var ComboBox = require( 'SUN/ComboBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/BlackBoxNode' );
  var WhiteBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/WhiteBoxNode' );
  var RevealButton = require( 'CIRCUIT_CONSTRUCTION_KIT/blackbox/view/RevealButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Color = require( 'SCENERY/util/Color' );

  // constants
  var fadedColor = new Color( '#e3edfc' ); // TODO: Factor me out
  var solidColor = CircuitConstructionKitConstants.backgroundColor;

  /**
   * @param {number} blackBoxWidth
   * @param {number} blackBoxHeight
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @param {Property.<Color>} backgroundColorProperty
   * @constructor
   */
  function BlackBoxSceneView( blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty, backgroundColorProperty ) {
    var blackBoxSceneView = this;
    CircuitConstructionKitScreenView.call( this, blackBoxSceneModel, {
      numberOfLeftBatteriesInToolbox: 0,
      toolboxOrientation: 'vertical',
      showResetAllButton: true
    } );

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
      comboBox.top = visibleBounds.top + CircuitConstructionKitConstants.layoutInset;
    } );

    var blackBoxNode = new BlackBoxNode( blackBoxWidth, blackBoxHeight, blackBoxSceneModel.revealingProperty, {

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

    blackBoxSceneModel.modeProperty.link( function( mode ) {
      var isBuildBode = mode === 'build';

      backgroundColorProperty.set( isBuildBode ? fadedColor : solidColor );
      if ( isBuildBode ) {
        blackBoxSceneView.circuitElementToolbox.moveToFront();
      }
      else {

        // investigate mode - move black box circuit elements to the back so they won't appear in front of the black box
        blackBoxSceneView.circuitNode.moveTrueBlackBoxElementsToBack();
      }
      whiteBoxNode.moveToBack();
    } );

    // When reset, move the boxes in front of the black box circuit elements
    this.resetBlackBoxSceneView = function() {
      blackBoxNode.moveToFront();
      whiteBoxNode.moveToBack();
    };

    // When dropping an object in "build mode", its vertices should pop inside the black box, see #113
    blackBoxSceneModel.circuit.vertexDroppedEmitter.addListener( function( vertex ) {

      // If the wire connected to a black box vertex, then it may no longer exist in the model.
      // In this case there is no need to move it inside the black box
      if ( blackBoxSceneModel.circuit.containsVertex( vertex ) && blackBoxSceneModel.mode === 'build' ) {

        var closestPoint = blackBoxNode.bounds.closestPointTo( vertex.position );
        var delta = closestPoint.minus( vertex.position );

        // TODO: Simplify these lines for common use cases
        var vertices = blackBoxSceneModel.circuit.findAllFixedVertices( vertex );
        blackBoxSceneView.circuitNode.translateVertexGroup( vertex, vertices, delta, null, [] );
      }
    } );
  }

  circuitConstructionKit.register( 'BlackBoxSceneView', BlackBoxSceneView );

  return inherit( CircuitConstructionKitScreenView, BlackBoxSceneView, {
    reset: function() {
      CircuitConstructionKitScreenView.prototype.reset.call( this );
      this.resetBlackBoxSceneView();
    }
  } );
} );