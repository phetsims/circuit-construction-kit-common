// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditContainerPanel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var WIRE_LINE_WIDTH = 12; // screen coordinates

  /**
   *
   * @constructor
   */
  function WireNode( circuitConstructionKitBasicsScreenView, circuitNode, wire ) {
    var wireNode = this;
    this.wire = wire;
    this.circuitElement = wire; // polymorphism with FixedLengthCircuitElementNode.  TODO: Common parent class?

    var highlightNode = new Path( null, {
      stroke: CircuitConstructionKitBasicsConstants.highlightColor,
      lineWidth: CircuitConstructionKitBasicsConstants.highlightLineWidth,
      pickable: false
    } );

    // In order to show a gradient on the line, while still allowing the line to stretch (without stretching rounded
    // ends), use a parent node to position and rotate the line, and keep the line the same width.
    // This increases the complexity of the code, but allows us to use Line renderer with a constant gradient.
    var normalGradient = new LinearGradient( 0, -WIRE_LINE_WIDTH / 2, 0, WIRE_LINE_WIDTH / 2 )
      .addColorStop( 0.0, new Color( '#7b332b' ).brighterColor( 0.8 ) )
      .addColorStop( 0.2, new Color( '#cd7767' ) )
      .addColorStop( 0.3, new Color( '#f6bda0' ) )
      .addColorStop( 1.0, new Color( '#3c0c08' ) );

    // TODO: Factor out reverse gradient if we keep it
    var reverseGradient = new LinearGradient( 0, -WIRE_LINE_WIDTH / 2, 0, WIRE_LINE_WIDTH / 2 )
      .addColorStop( 1.0 - 1.0, new Color( '#3c0c08' ) )
      .addColorStop( 1.0 - 0.3, new Color( '#f6bda0' ) )
      .addColorStop( 1.0 - 0.2, new Color( '#cd7767' ) )
      .addColorStop( 1.0 - 0.0, new Color( '#7b332b' ).brighterColor( 0.8 ) );

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

    // @private
    this.lineNodeParent = lineNodeParent;

    // @private
    this.lineNode = lineNode;
    Node.call( this, {
      children: [
        lineNodeParent,
        highlightNode
      ]
    } );

    wire.interactiveProperty.link( function( interactive ) {
      wireNode.pickable = interactive;
    } );

    var highlightStrokeStyles = new LineStyles( {
      lineWidth: 26,
      lineCap: 'round',
      lineJoin: 'round'
    } );

    var startListener = function( startPoint ) {
      lineNodeParent.setTranslation( startPoint.x, startPoint.y );
      endListener && endListener( wire.endVertex.position );
      if ( highlightNode.visible ) {
        highlightNode.shape = wireNode.getStrokedShape( highlightStrokeStyles );
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
      if ( highlightNode.visible ) {
        highlightNode.shape = wireNode.getStrokedShape( highlightStrokeStyles );
      }

      // normal angle
      var directionForNormalLighting = new Vector2( 167.67173252279636, 72.6241134751773 );
      var dot = directionForNormalLighting.dot( deltaVector );

      lineNode.stroke = dot < 0 ? reverseGradient : normalGradient;
    };

    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( endListener );
      newEndVertex.positionProperty.link( endListener );
    };
    wire.endVertexProperty.link( updateEndVertex );

    var p = null;
    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;

        if ( wire.interactive ) {
          circuitNode.startDrag( event.pointer.point, wire.startVertex, false );
          circuitNode.startDrag( event.pointer.point, wire.endVertex, false );
        }
      },
      drag: function( event ) {
        if ( wire.interactive ) {
          circuitNode.drag( event.pointer.point, wire.startVertex, false );
          circuitNode.drag( event.pointer.point, wire.endVertex, false );
        }
      },
      end: function( event ) {

        // If over the toolbox, then drop into it, and don't process further
        if ( circuitConstructionKitBasicsScreenView.canNodeDropInToolbox( wireNode ) ) {
          circuitConstructionKitBasicsScreenView.dropCircuitElementNodeInToolbox( wireNode );
          return;
        }
        if ( !wire.interactive ) {
          return;
        }

        circuitNode.endDrag( event, wire.startVertex );
        circuitNode.endDrag( event, wire.endVertex );

        // Only show the editor when tapped tap, not on every drag.
        // TODO: Shared code with VertexNode and FixedLengthCircuitElementNode
        if ( event.pointer.point.distance( p ) < CircuitConstructionKitBasicsConstants.tapThreshold ) {

          circuitNode.circuit.selectedCircuitElementProperty.set( wire );

          // When the user clicks on anything else, deselect the vertex
          var deselect = function( event ) {

            // Detect whether the user is hitting something pickable in the CircuitElementEditContainerPanel
            var circuitElementEditContainerPanel = false;
            for ( var i = 0; i < event.trail.nodes.length; i++ ) {
              var trailNode = event.trail.nodes[ i ];
              if ( trailNode instanceof CircuitElementEditContainerPanel ) {
                circuitElementEditContainerPanel = true;
              }
            }

            // If the user clicked outside of the CircuitElementEditContainerPanel, then hide the edit panel and
            // deselect the circuitElement
            if ( !circuitElementEditContainerPanel ) {
              circuitNode.circuit.selectedCircuitElementProperty.set( null );
              event.pointer.removeInputListener( listener ); // Thanks, hoisting!
            }
          };
          var listener = {
            mouseup: deselect,
            touchup: deselect
          };
          event.pointer.addInputListener( listener );
        }
      }
    } );
    wire.interactive && wireNode.addInputListener( this.inputListener );
    this.disposeWireNode = function() {
      wireNode.inputListener.dragging && wireNode.inputListener.endDrag();

      wire.startVertexProperty.unlink( updateStartVertex );
      wire.endVertexProperty.unlink( updateEndVertex );
    };

    if ( circuitNode ) {
      circuitNode.circuit.selectedCircuitElementProperty.link( function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === wire;
        highlightNode.visible = showHighlight;
        if ( highlightNode.visible ) {
          highlightNode.shape = wireNode.getStrokedShape( highlightStrokeStyles );
        }
      } );
    }
  }

  return inherit( Node, WireNode, {

    // @public
    dispose: function() {
      this.disposeWireNode();
    },

    // @public
    getStrokedShape: function( lineStyles ) {
      return this.lineNode.getStrokedShape( lineStyles ).transformed( this.lineNodeParent.matrix );
    }
  } );
} );