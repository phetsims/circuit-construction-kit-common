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
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @constructor
   */
  function VertexNode( circuitNode, vertex ) {
    var circuit = circuitNode.circuit;
    this.vertex = vertex;
    this.startOffset = null;// @public Will be added by CircuitNode during dragging, used for relative drag location.

    // Start as a dotted line, becomes solid when connected to >1 component.
    var circleNode = new Circle( 20, { stroke: 'black', lineWidth: 3, lineDash: [ 8, 6 ], cursor: 'pointer' } );
    Node.call( this, {
      children: [ circleNode ]
    } );

    var updateShape = function() {
      var edgeCount = circuit.countCircuitElements( vertex );
      circleNode.fill = edgeCount > 1 ? CircuitConstructionKitBasicsConstants.wireColor : null;
    };
    circuit.vertices.addItemAddedListener( updateShape );
    circuit.vertices.addItemRemovedListener( updateShape );

    var simpleDragHandler = new SimpleDragHandler( {
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
    this.addInputListener( simpleDragHandler );

    var updateReadoutTextLocation = function() {
      voltageReadoutText.centerX = circleNode.centerX;
      voltageReadoutText.bottom = circleNode.top - 10;
    };
    // TODO: For debugging, remove when debugged.
    var voltageReadoutText = new Text( '', { fontSize: 18, y: -60 } );
    this.addChild( voltageReadoutText );
    vertex.voltageProperty.link( function( voltage ) {
      voltageReadoutText.setText( Util.toFixed( voltage, 3 ) + 'V' );
      updateReadoutTextLocation();
    } );

    var updateVertexNodePosition = function( position ) {
      circleNode.center = position;
      updateReadoutTextLocation();
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    this.disposeVertexNode = function() {
      if ( simpleDragHandler.dragging ) {
        simpleDragHandler.endDrag();
      }
      vertex.positionProperty.unlink( updateVertexNodePosition );
    };
  }

  circuitConstructionKitBasics.register( 'VertexNode', VertexNode );

  return inherit( Node, VertexNode, {
    dispose: function() {
      this.disposeVertexNode();
    }
  } );
} );