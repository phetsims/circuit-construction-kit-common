// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementNode' );

  // phet-io modules
  var TNode = require( 'ifphetio!PHET_IO/types/scenery/nodes/TNode' );

  // constants
  var WIRE_LINE_WIDTH = 12; // screen coordinates

  /**
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - if null, this WireNode is just an icon
   * @param {CircuitNode} circuitNode
   * @param {Wire} wire
   * @param {Property.<boolean>} to match the constructors of other circuit element nodes
   * @param {Tandem} tandem
   * @constructor
   */
  function WireNode( circuitConstructionKitScreenView, circuitNode, wire, runningProperty, tandem ) {
    var self = this;
    this.wire = wire;

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
    CircuitElementNode.call( this, wire, {
      children: [
        lineNodeParent
      ]
    } );

    var updatePickable = function( interactive ) {
      self.pickable = interactive;
    };
    wire.interactiveProperty.link( updatePickable );

    var highlightStrokeStyles = new LineStyles( {
      lineWidth: 26,
      lineCap: 'round',
      lineJoin: 'round'
    } );

    var startListener = function( startPoint ) {
      lineNodeParent.setTranslation( startPoint.x, startPoint.y );
      highlightNodeParent.setTranslation( startPoint.x, startPoint.y );
      endListener && endListener( wire.endVertex.position );
      if ( highlightNode.visible ) {
        highlightNode.shape = self.getHighlightStrokedShape( highlightStrokeStyles );
      }
    };

    // There is a double nested property, since the vertex may change and the position may change
    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( startListener );
      newStartVertex.positionProperty.link( startListener );
    };
    wire.startVertexProperty.link( updateStartVertex );

    var endListener = function( endPoint ) {
      lineNode.setPoint2( endPoint.distance( wire.startVertex.position ), 0 );
      var deltaVector = endPoint.minus( wire.startVertex.position );
      lineNodeParent.setRotation( deltaVector.angle() );
      highlightNodeParent.setRotation( deltaVector.angle() );
      if ( highlightNode.visible ) {
        highlightNode.shape = self.getHighlightStrokedShape( highlightStrokeStyles );
      }

      // normal angle
      var directionForNormalLighting = new Vector2( 167.67173252279636, 72.6241134751773 ); // sampled manually
      var dot = directionForNormalLighting.dot( deltaVector );

      lineNode.stroke = dot < 0 ? reverseGradient : normalGradient;
    };

    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( endListener );
      newEndVertex.positionProperty.link( endListener );
    };
    wire.endVertexProperty.link( updateEndVertex );

    var p = null;
    var didDrag = false;

    if ( circuitConstructionKitScreenView ) {
      this.inputListener = new TandemSimpleDragHandler( {
        allowTouchSnag: true,
        tandem: tandem.createTandem( 'inputListener' ),
        start: function( event ) {
          p = event.pointer.point;

          if ( wire.interactive ) {
            circuitNode.startDrag( event.pointer.point, wire.startVertex, false );
            circuitNode.startDrag( event.pointer.point, wire.endVertex, false );
          }
          didDrag = false;
        },
        drag: function( event ) {
          if ( wire.interactive ) {
            circuitNode.drag( event.pointer.point, wire.startVertex, false );
            circuitNode.drag( event.pointer.point, wire.endVertex, false );
            didDrag = true;
          }
        },
        end: function( event ) {

          // If over the toolbox, then drop into it, and don't process further
          if ( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) ) {
            circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( self );
            return;
          }
          if ( !wire.interactive ) {
            return;
          }

          circuitNode.endDrag( event, wire.startVertex, didDrag );
          circuitNode.endDrag( event, wire.endVertex, didDrag );

          // Only show the editor when tapped, not on every drag.
          self.maybeSelect( event, circuitNode, p );

          didDrag = false;
        }
      } );
      self.addInputListener( this.inputListener );
    }

    if ( circuitNode ) {
      var updateHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === wire;
        highlightNode.visible = showHighlight;
        if ( highlightNode.visible ) {
          highlightNode.shape = self.getHighlightStrokedShape( highlightStrokeStyles );
        }
      };
      circuitNode.circuit.selectedCircuitElementProperty.link( updateHighlight );
    }

    this.disposeWireNode = function() {
      self.inputListener.dragging && self.inputListener.endDrag();

      wire.startVertexProperty.unlink( updateStartVertex );
      wire.endVertexProperty.unlink( updateEndVertex );

      updateHighlight && circuitNode.circuit.selectedCircuitElementProperty.unlink( updateHighlight );
      wire.interactiveProperty.unlink( updatePickable );

      wire.startVertex.positionProperty.unlink( startListener );
      wire.endVertex.positionProperty.unlink( endListener );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightNodeParent );
      tandem.removeInstance( this );
    };

    tandem.addInstance( this, TNode );
  }

  circuitConstructionKitCommon.register( 'WireNode', WireNode );

  return inherit( CircuitElementNode, WireNode, {

    // @public
    dispose: function() {
      this.disposeWireNode();
      CircuitElementNode.prototype.dispose.call( this );
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