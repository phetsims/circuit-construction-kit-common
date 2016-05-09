// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitElementNode' );
  var CheckBox = require( 'SUN/CheckBox' );

  // constants
  var WIRE_LINE_WIDTH = 12; // screen coordinates

  /**
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - if null, this SwitchNode is just an icon
   * @param {CircuitNode} circuitNode
   * @param {Wire} switchModel
   * @constructor
   */
  function SwitchNode( circuitConstructionKitScreenView, circuitNode, switchModel ) {
    var wireNode = this;
    this.switchModel = switchModel;

    var highlightNode = new Path( null, {
      stroke: CircuitConstructionKitConstants.highlightColor,
      lineWidth: CircuitConstructionKitConstants.highlightLineWidth,
      pickable: false,
      visible: false
    } );

    // In order to show a gradient on the line, while still allowing the line to stretch (without stretching rounded
    // ends), use a parent node to position and rotate the line, and keep the line the same width.
    // This increases the complexity of the code, but allows us to use Line renderer with a constant gradient.

    /**
     * Create a LinearGradient for the wire, depending on the orientation relative to the shading (light comes from
     * top left)
     * @param {{point:number,color:Color}} array
     * @param {function} op
     * @returns {LinearGradient}
     */
    var createGradient = function( array, op ) {
      var normalGradient = new LinearGradient( 0, -WIRE_LINE_WIDTH / 2, 0, WIRE_LINE_WIDTH / 2 );
      array.forEach( function( element ) {normalGradient.addColorStop( op( element.point ), element.color );} );
      return normalGradient;
    };

    var array = [
      { point: 0.0, color: new Color( '#7b332b' ).brighterColor( 0.8 ) },
      { point: 0.2, color: new Color( '#cd7767' ) },
      { point: 0.3, color: new Color( '#f6bda0' ) },
      { point: 1.0, color: new Color( '#3c0c08' ) }
    ];

    var normalGradient = createGradient( array, function( e ) {return e;} );
    var reverseGradient = createGradient( array.reverse(), function( e ) {return 1.0 - e;} );

    var lineNode = new Line( 0, 0, 100, 0, {
      stroke: normalGradient,
      lineWidth: WIRE_LINE_WIDTH,
      cursor: 'pointer',
      strokePickable: true,
      lineCap: 'round'
    } );

    var lineNodeParent = new Node( {
      children: [ lineNode ]
    } );
    var highlightNodeParent = new Node( {
      children: [ highlightNode ]
    } );

    circuitNode && circuitNode.highlightLayer.addChild( highlightNodeParent );

    // @private
    this.lineNodeParent = lineNodeParent;

    // @private
    this.lineNode = lineNode;
    CircuitElementNode.call( this, switchModel, {
      children: [
        lineNodeParent
      ]
    } );

    var checkBox = CheckBox.createTextCheckBox( 'Closed', {}, switchModel.closedProperty, {} );
    this.addChild( checkBox );

    var updatePickable = function( interactive ) {
      wireNode.pickable = interactive;
    };
    switchModel.interactiveProperty.link( updatePickable );

    var highlightStrokeStyles = new LineStyles( {
      lineWidth: 26,
      lineCap: 'round',
      lineJoin: 'round'
    } );

    // Position the checkbox
    var updateCheckBox = function() {
      var center = switchModel.startVertex.position.plus( switchModel.endVertex.position ).timesScalar( 0.5 );
      var normal = switchModel.endVertex.position.minus( switchModel.startVertex.position ).normalized().perpendicular().timesScalar( 50 );
      checkBox.center = center.plus( normal );
    };

    var startListener = function( startPoint ) {
      lineNodeParent.setTranslation( startPoint.x, startPoint.y );
      highlightNodeParent.setTranslation( startPoint.x, startPoint.y );
      endListener && endListener( switchModel.endVertex.position );
      if ( highlightNode.visible ) {
        highlightNode.shape = wireNode.getHighlightStrokedShape( highlightStrokeStyles );
      }
      updateCheckBox();
    };

    // There is a double nested property, since the vertex may change and the position may change
    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( startListener );
      newStartVertex.positionProperty.link( startListener );
    };
    switchModel.startVertexProperty.link( updateStartVertex );

    var endListener = function( endPoint ) {
      lineNode.setPoint2( endPoint.distance( switchModel.startVertex.position ), 0 );
      var deltaVector = endPoint.minus( switchModel.startVertex.position );
      lineNodeParent.setRotation( deltaVector.angle() );
      highlightNodeParent.setRotation( deltaVector.angle() );
      if ( highlightNode.visible ) {
        highlightNode.shape = wireNode.getHighlightStrokedShape( highlightStrokeStyles );
      }

      // normal angle
      var directionForNormalLighting = new Vector2( 167.67173252279636, 72.6241134751773 ); // sampled manually
      var dot = directionForNormalLighting.dot( deltaVector );

      lineNode.stroke = dot < 0 ? reverseGradient : normalGradient;

      updateCheckBox();
    };

    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( endListener );
      newEndVertex.positionProperty.link( endListener );
    };
    switchModel.endVertexProperty.link( updateEndVertex );

    var p = null;
    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;

        if ( switchModel.interactive ) {
          circuitNode.startDrag( event.pointer.point, switchModel.startVertex, false );
          circuitNode.startDrag( event.pointer.point, switchModel.endVertex, false );
        }
      },
      drag: function( event ) {
        if ( switchModel.interactive ) {
          circuitNode.drag( event.pointer.point, switchModel.startVertex, false );
          circuitNode.drag( event.pointer.point, switchModel.endVertex, false );
        }
      },
      end: function( event ) {

        // If over the toolbox, then drop into it, and don't process further
        if ( circuitConstructionKitScreenView.canNodeDropInToolbox( wireNode ) ) {
          circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( wireNode );
          return;
        }
        if ( !switchModel.interactive ) {
          return;
        }

        circuitNode.endDrag( event, switchModel.startVertex );
        circuitNode.endDrag( event, switchModel.endVertex );

        // Only show the editor when tapped, not on every drag.
        wireNode.maybeSelect( event, circuitNode, p );
      }
    } );
    circuitConstructionKitScreenView && wireNode.addInputListener( this.inputListener );

    if ( circuitNode ) {
      var updateHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === switchModel;
        highlightNode.visible = showHighlight;
        if ( highlightNode.visible ) {
          highlightNode.shape = wireNode.getHighlightStrokedShape( highlightStrokeStyles );
        }
      };
      circuitNode.circuit.selectedCircuitElementProperty.link( updateHighlight );
    }

    // Only show the wire if the switch is closed.
    switchModel.closedProperty.link( function( closed ) {
      wireNode.lineNode.visible = closed;
    } );

    this.disposeSwitchNode = function() {
      wireNode.inputListener.dragging && wireNode.inputListener.endDrag();

      switchModel.startVertexProperty.unlink( updateStartVertex );
      switchModel.endVertexProperty.unlink( updateEndVertex );

      updateHighlight && circuitNode.circuit.selectedCircuitElementProperty.unlink( updateHighlight );
      switchModel.interactiveProperty.unlink( updatePickable );

      switchModel.startVertex.positionProperty.unlink( startListener );
      switchModel.endVertex.positionProperty.unlink( endListener );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightNodeParent );
      checkBox.dispose();
    };
  }

  circuitConstructionKit.register( 'SwitchNode', SwitchNode );

  return inherit( CircuitElementNode, SwitchNode, {

    // @public
    dispose: function() {
      this.disposeSwitchNode();
    },

    // @private
    getHighlightStrokedShape: function( lineStyles ) {
      return this.lineNode.shape.getStrokedShape( lineStyles );
    },

    // @public
    getStrokedShape: function() {
      return this.lineNode.getStrokedShape().transformed( this.lineNodeParent.matrix );
    }
  } );
} );