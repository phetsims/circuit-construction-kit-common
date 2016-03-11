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
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );

  // constants
  var TAP_THRESHOLD = 10; // Number of pixels (screen coordinates) that constitutes a tap instead of a drag

  /**
   *
   * @constructor
   */
  function VertexNode( circuitNode, vertex ) {
    var vertexNode = this;
    var circuit = circuitNode.circuit;
    this.vertex = vertex;
    this.startOffset = null;// @public - added by CircuitNode during dragging, used for relative drag location.

    // Start as a dotted line, becomes solid when connected to >1 component.
    var dottedLineNode = new Circle( 20, { stroke: 'black', lineWidth: 3, lineDash: [ 8, 6 ], cursor: 'pointer' } );
    var highlightNode = new Circle( 30, { stroke: 'yellow', lineWidth: 4, pickable: false } );

    var cutButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: new FontAwesomeNode( 'cut', {
        rotation: -Math.PI / 2, // scissors point up
        scale: 0.85
      } ),
      minXMargin: 10,
      minYMargin: 10
    } );

    vertex.selectedProperty.link( function( selected ) {
      selected && vertexNode.moveToFront();
      highlightNode.visible = selected;

      var numberConnections = circuit.getNeighborCircuitElements( vertex ).length;
      cutButton.visible = selected;

      // Show a disabled button as a cue that the vertex could be cuttable, but it isnt right now.
      cutButton.enabled = numberConnections > 1;
    } );
    Node.call( this, {
      children: [ highlightNode, dottedLineNode, cutButton ]
    } );

    var updateShape = function() {
      var edgeCount = circuit.countCircuitElements( vertex );
      dottedLineNode.fill = edgeCount > 1 ? CircuitConstructionKitBasicsConstants.wireColor : null;
    };
    circuit.vertices.addItemAddedListener( updateShape );
    circuit.vertices.addItemRemovedListener( updateShape );

    var p = null;
    var simpleDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;
        circuitNode.startDrag( event, vertex );
      },
      drag: function( event ) {
        circuitNode.drag( event, vertex );
      },
      end: function( event ) {
        circuitNode.endDrag( event, vertex );

        // Only show on a tap, not on every drag.
        if ( event.pointer.point.distance( p ) < TAP_THRESHOLD ) {

          vertex.selected = true;

          // When the user clicks on anything else, deselect the vertex
          var deselect = function() {
            vertex.selected = false;
            event.pointer.removeInputListener( listener ); // Thanks, hoisting!
          };
          var listener = {
            mouseup: deselect,
            touchup: deselect
          };
          event.pointer.addInputListener( listener );
        }
      }
    } );

    // Don't permit dragging by the scissors or highlight
    dottedLineNode.addInputListener( simpleDragHandler );
    vertex.interactiveProperty.link( function( interactive ) {
      vertexNode.pickable = interactive;
    } );

    var updateReadoutTextLocation = function() {
      voltageReadoutText.centerX = dottedLineNode.centerX;
      voltageReadoutText.bottom = dottedLineNode.top - 10;
    };

    // TODO: For debugging, remove when debugged.
    var voltageReadoutText = new Text( '', { fontSize: 18, y: -60 } );
    this.addChild( voltageReadoutText );
    vertex.voltageProperty.link( function( voltage ) {
      voltageReadoutText.setText( Util.toFixed( voltage, 3 ) + 'V' );
      updateReadoutTextLocation();
    } );

    var updateVertexNodePosition = function( position ) {
      dottedLineNode.center = position;
      highlightNode.center = position;
      cutButton.center = position.plusXY( 100, 0 );
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