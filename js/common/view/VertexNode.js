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
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  /**
   *
   * @constructor
   */
  function VertexNode( circuit, vertex ) {
    var vertexNode = this;
    this.vertex = vertex;
    //Circle.call( this, 20, { fill: CircuitConstructionKitBasicsConstants.wireColor } );

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

    this.movableDragHandler = new MovableDragHandler( vertex.positionProperty, {
      onDrag: function( event ) {

        // Is there a nearby vertex this one could snap to?
        var targetVertex = circuit.getDropTarget( vertex );
        if ( targetVertex ) {

          // choose the 1st one arbitrarily
          vertex.positionProperty.set( targetVertex.positionProperty.get() );
        }
      },
      endDrag: function( event ) {

        // Is there a nearby vertex this one could snap to?
        var targetVertex = circuit.getDropTarget( vertex );
        if ( targetVertex ) {

          // connect
          circuit.connect( vertex, targetVertex );
        }
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