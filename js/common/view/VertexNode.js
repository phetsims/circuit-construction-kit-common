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
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @constructor
   */
  function VertexNode( circuitNode, vertex ) {
    var circuit = circuitNode.circuit;
    var vertexNode = this;
    this.vertex = vertex;
    this.startOffset = null;// @public Will be added by CircuitNode during dragging, used for relative drag location.

    // Start as a dotted line, becomes solid when connected to >1 component.
    Circle.call( this, 20, { stroke: 'black', lineWidth: 3, lineDash: [ 8, 6 ], cursor: 'pointer' } );

    var updateShape = function() {
      var edgeCount = circuit.countCircuitElements( vertex );
      vertexNode.fill = edgeCount > 1 ? CircuitConstructionKitBasicsConstants.wireColor : null;
    };
    circuit.vertices.addItemAddedListener( updateShape );
    circuit.vertices.addItemRemovedListener( updateShape );
    var updateVertexNodePosition = function( position ) {
      vertexNode.center = position;
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    this.disposeVertexNode = function() {
      vertex.positionProperty.unlink( updateVertexNodePosition );
    };

    // TODO: Rename
    this.movableDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        circuitNode.startDrag( event, vertex );
      },
      drag: function( event ) {
        circuitNode.drag( event, vertex );
      },
      end: function( event ) {
        circuitNode.endDrag( event, vertex );
      }
    } );
    this.addInputListener( this.movableDragHandler );
  }

  circuitConstructionKitBasics.register( 'VertexNode', VertexNode );

  return inherit( Circle, VertexNode, {
    dispose: function() {
      this.disposeVertexNode();
    }
  } );
} );