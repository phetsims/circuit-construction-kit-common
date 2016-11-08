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
  var CircuitConstructionKitScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitConstructionKitScreenView' );
  var ChallengeSet = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/model/ChallengeSet' );
  var ModeRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/ModeRadioButtonGroup' );
  var ComboBox = require( 'SUN/ComboBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/BlackBoxNode' );
  var WhiteBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/WhiteBoxNode' );
  var RevealButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/RevealButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Color = require( 'SCENERY/util/Color' );

  // constants
  var fadedColor = new Color( '#e3edfc' );
  var solidColor = CircuitConstructionKitConstants.backgroundColor;

  /**
   * @param {number} blackBoxWidth
   * @param {number} blackBoxHeight
   * @param {BlackBoxSceneModel} blackBoxSceneModel
   * @param {Property.<string>} sceneProperty - for switching screens
   * @constructor
   */
  function BlackBoxSceneView( blackBoxWidth, blackBoxHeight, blackBoxSceneModel, sceneProperty, tandem ) {
    var self = this;
    CircuitConstructionKitScreenView.call( this, blackBoxSceneModel, tandem, {
      numberOfLeftBatteriesInToolbox: 0,
      toolboxOrientation: 'vertical',
      showResetAllButton: true
    } );

    // Add 'Explore' and 'Test' radio buttons under the sensor toolbox
    var modeRadioButtonGroup = new ModeRadioButtonGroup( blackBoxSceneModel.modeProperty, tandem.createTandem( 'modeRadioButtonGroup' ) );
    this.addChild( modeRadioButtonGroup );

    var revealButton = new RevealButton( blackBoxSceneModel.revealingProperty, blackBoxSceneModel.isRevealEnabledProperty,
      tandem.createTandem( 'revealButton' )
    );
    this.addChild( revealButton );

    // Circuit components and ammeter/voltmeter should be in front of these controls
    modeRadioButtonGroup.moveToBack();
    revealButton.moveToBack();

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
    var sceneSelectionComboBox = new ComboBox( elements, sceneProperty, this, {
      tandem: tandem.createTandem( 'sceneSelectionComboBox' )
    } );
    this.addChild( sceneSelectionComboBox );

    // Layout when the screen view size changed
    this.visibleBoundsProperty.link( function( visibleBounds ) {
      modeRadioButtonGroup.top = self.sensorToolbox.bottom + 20;
      modeRadioButtonGroup.right = self.sensorToolbox.right;

      revealButton.top = modeRadioButtonGroup.bottom + 10;
      revealButton.right = modeRadioButtonGroup.right;

      sceneSelectionComboBox.centerX = visibleBounds.centerX;
      sceneSelectionComboBox.top = visibleBounds.top + CircuitConstructionKitConstants.layoutInset;
    } );

    var blackBoxNode = new BlackBoxNode( blackBoxWidth, blackBoxHeight, blackBoxSceneModel.revealingProperty, {

      // Assumes the default layout bounds are used
      center: ScreenView.DEFAULT_LAYOUT_BOUNDS.center
    } );

    // Expand the black box bounds so all of the black box vertices are inside the bounds, see #128
    blackBoxSceneModel.blackBoxBounds = blackBoxNode.bounds.dilated( 7 );
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

      self.backgroundPlane.fill = isBuildBode ? fadedColor : solidColor;
      if ( isBuildBode ) {
        self.circuitElementToolbox.moveToFront();
      }
      else {

        // investigate mode - move black box circuit elements to the back so they won't appear in front of the black box
        self.circuitNode.moveTrueBlackBoxElementsToBack();
      }
      whiteBoxNode.moveToBack();
      self.moveBackgroundToBack();
    } );

    // When reset, move the boxes in front of the black box circuit elements
    this.resetBlackBoxSceneView = function() {
      blackBoxNode.moveToFront();
      whiteBoxNode.moveToBack();
      self.moveBackgroundToBack();
    };

    // When dropping an object in "build mode", its vertices should pop inside the black box, see #113
    // TODO: Let's move this to the model, and make the blackBoxNodeBounds available there.
    blackBoxSceneModel.circuit.vertexDroppedEmitter.addListener( function( vertex ) {

      // Allow the wire drag event to complete so that the wire won't think it was released near another target
      // and attach to it, see #173
      setTimeout( function() {
        // If the wire connected to a black box vertex, then it may no longer exist in the model.
        // In this case there is no need to move it inside the black box
        if ( blackBoxSceneModel.circuit.containsVertex( vertex ) && blackBoxSceneModel.mode === 'build' ) {

          // Find all the vertices that must be translated into the box, translating wires
          (function() {
            var vertices = blackBoxSceneModel.circuit.findAllConnectedVertices( vertex );
            var connectedToBlackBox = vertices.filter( function( v ) {return v.blackBoxInterface;} ).length > 0;
            if ( !connectedToBlackBox ) {
              for ( var i = 0; i < vertices.length; i++ ) {
                var vertexInGroup = vertices[ i ];

                var closestPoint = blackBoxNode.bounds.eroded( 30 ).closestPointTo( vertexInGroup.position );
                var delta = closestPoint.minus( vertexInGroup.position );

                self.circuitNode.translateVertexGroup( vertexInGroup, vertices, delta, null, [] );
              }
            }
          })();

          // Find all the vertices that must be translated into the box, shrinking wires
          // TODO: Factor out
          (function() {
            var vertices = blackBoxSceneModel.circuit.findAllFixedVertices( vertex );
            var connectedToBlackBox = vertices.filter( function( v ) {return v.blackBoxInterface;} ).length > 0;
            if ( !connectedToBlackBox ) {
              for ( var i = 0; i < vertices.length; i++ ) {
                var vertexInGroup = vertices[ i ];

                var closestPoint = blackBoxNode.bounds.eroded( 30 ).closestPointTo( vertexInGroup.position );
                var delta = closestPoint.minus( vertexInGroup.position );

                self.circuitNode.translateVertexGroup( vertexInGroup, vertices, delta, null, [] );
              }
            }
          })();
        }
      }, 0 );
    } );
    this.moveBackgroundToBack();
  }

  circuitConstructionKitCommon.register( 'BlackBoxSceneView', BlackBoxSceneView );

  return inherit( CircuitConstructionKitScreenView, BlackBoxSceneView, {
    reset: function() {
      CircuitConstructionKitScreenView.prototype.reset.call( this );
      this.resetBlackBoxSceneView();
    }
  } );
} );