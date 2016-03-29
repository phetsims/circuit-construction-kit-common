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
    Line.call( this, 0, 0, 100, 100, {
      stroke: CircuitConstructionKitBasicsConstants.wireColor,
      lineWidth: WIRE_LINE_WIDTH,
      cursor: 'pointer',
      strokePickable: true,
      lineCap: 'round',
      children: [
        highlightNode
      ]
    } );

    var strokeStyles = new LineStyles( {
      lineWidth: 26,
      lineCap: 'round',
      lineJoin: 'round'
    } );

    var startListener = function( startPoint ) {
      wireNode.setPoint1( startPoint );
      if ( highlightNode.visible ) {
        highlightNode.shape = wireNode.shape.getStrokedShape( strokeStyles );
      }
    };

    // There is a double nested property, since the vertex may change and the position may change
    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( startListener );
      newStartVertex.positionProperty.link( startListener );
    };
    wire.startVertexProperty.link( updateStartVertex );

    var endListener = function( endPoint ) {
      wireNode.setPoint2( endPoint );
      if ( highlightNode.visible ) {
        highlightNode.shape = wireNode.shape.getStrokedShape( strokeStyles );
      }
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

        circuitNode.startDrag( event.pointer.point, wire.startVertex, false );
        circuitNode.startDrag( event.pointer.point, wire.endVertex, false );
      },
      drag: function( event ) {
        circuitNode.drag( event.pointer.point, wire.startVertex, false );
        circuitNode.drag( event.pointer.point, wire.endVertex, false );
      },
      end: function( event ) {

        // If over the toolbox, then drop into it, and don't process further
        if ( circuitConstructionKitBasicsScreenView.canNodeDropInToolbox( wireNode ) ) {
          circuitConstructionKitBasicsScreenView.dropCircuitElementNodeInToolbox( wireNode );
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
          highlightNode.shape = wireNode.shape.getStrokedShape( strokeStyles );
        }
      } );
    }
  }

  return inherit( Line, WireNode, {
    dispose: function() {
      this.disposeWireNode();
    }
  } );
} );