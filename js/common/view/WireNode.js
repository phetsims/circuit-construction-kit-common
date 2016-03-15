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
  var Node = require( 'SCENERY/nodes/Node' );
  var Line = require( 'SCENERY/nodes/Line' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   *
   * @constructor
   */
  function WireNode( circuitNode, wire ) {
    var wireNode = this;
    this.wire = wire;

    Line.call( this, 0, 0, 100, 100, {
      stroke: CircuitConstructionKitBasicsConstants.wireColor,
      lineWidth: 20,
      cursor: 'pointer',
      strokePickable: true
    } );

    var startListener = function( startPoint ) {
      wireNode.setPoint1( startPoint );
    };

    // There is a double nested property, since the vertex may change and the position may change
    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( startListener );
      newStartVertex.positionProperty.link( startListener );
    };
    wire.startVertexProperty.link( updateStartVertex );

    var endListener = function( endPoint ) {
      wireNode.setPoint2( endPoint );
    };
    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( endListener );
      newEndVertex.positionProperty.link( endListener );
    };
    wire.endVertexProperty.link( updateEndVertex );

    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        circuitNode.startDrag( event.pointer.point, wire.startVertex, false );
        circuitNode.startDrag( event.pointer.point, wire.endVertex, false );
      },
      drag: function( event ) {
        circuitNode.drag( event.pointer.point, wire.startVertex, false );
        circuitNode.drag( event.pointer.point, wire.endVertex, false );
      },
      end: function( event ) {
        circuitNode.endDrag( event, wire.startVertex );
        circuitNode.endDrag( event, wire.endVertex );
      }
    } );
    wire.interactive && wireNode.addInputListener( this.inputListener );
    this.disposeWireNode = function() {
      wireNode.inputListener.dragging && wireNode.inputListener.endDrag();

      wire.startVertexProperty.unlink( updateStartVertex );
      wire.endVertexProperty.unlink( updateEndVertex );
    };
  }

  return inherit( Line, WireNode, {
    dispose: function() {
      this.disposeWireNode();
    }
  } );
} );