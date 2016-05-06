// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var DISTANCE_TO_CUT_BUTTON = 70; // How far (screen coordinates) the cut button appears from the vertex node

  /**
   *
   * @constructor
   */
  function VertexNode( circuitNode, vertex ) {
    var vertexNode = this;
    var circuit = circuitNode.circuit;
    this.vertex = vertex;
    this.startOffset = null;// @public - added by CircuitNode during dragging, used for relative drag location.

    // @public (read-only) - for hit testing with probes
    this.dottedLineNodeRadius = 16;

    // Start as a dotted line, becomes solid when connected to >1 element.
    var dottedLineNode = new Circle( this.dottedLineNodeRadius, {
      stroke: 'black',
      lineWidth: 1.3,
      lineDash: [ 6, 4 ],
      cursor: 'pointer'
    } );
    var highlightNode = new Circle( 30, {
      stroke: CircuitConstructionKitConstants.highlightColor,
      lineWidth: CircuitConstructionKitConstants.highlightLineWidth,
      pickable: false
    } );

    var cutButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: new FontAwesomeNode( 'cut', {
        rotation: -Math.PI / 2, // scissors point up
        scale: CircuitConstructionKitConstants.fontAwesomeIconScale
      } ),
      minXMargin: 10,
      minYMargin: 10,
      listener: function() {
        circuit.cutVertex( vertex );
      }
    } );

    var updateSelected = function( selected ) {
      var neighborCircuitElements = circuit.getNeighborCircuitElements( vertex );

      if ( selected ) {

        // Adjacent components should be in front of the vertex, see #20
        for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
          neighborCircuitElements[ i ].vertexSelectedEmitter.emit();
        }

        vertexNode.moveToFront();
      }
      highlightNode.visible = selected;

      var numberConnections = neighborCircuitElements.length;
      cutButton.visible = selected;
      selected && updateCutButtonPosition();

      // Show a disabled button as a cue that the vertex could be cuttable, but it isn't right now.
      var isConnectedBlackBoxVertex = numberConnections === 1 && !vertexNode.vertex.draggable;
      cutButton.enabled = numberConnections > 1 || isConnectedBlackBoxVertex;
    };
    vertex.selectedProperty.link( updateSelected );
    var updateMoveToFront = function() {
      vertexNode.moveToFront();
    };
    vertex.moveToFrontEmitter.addListener( updateMoveToFront );
    Node.call( this, {
      children: [ dottedLineNode, cutButton ]
    } );
    circuitNode.highlightLayer.addChild( highlightNode );

    var updatePickable = function( interactive ) {
      vertexNode.pickable = interactive;
    };
    vertex.interactiveProperty.link( updatePickable );

    // var updateShape = function() {
    //   var edgeCount = circuit.countCircuitElements( vertex );
    //   dottedLineNode.fill = edgeCount > 1 ? CircuitConstructionKitConstants.solderColor : null;
    // };
    // circuit.vertices.addItemAddedListener( updateShape );
    // circuit.vertices.addItemRemovedListener( updateShape );

    var p = null;
    var simpleDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;
        vertex.draggable && circuitNode.startDrag( event.pointer.point, vertex, true );
      },
      drag: function( event ) {
        vertex.draggable && circuitNode.drag( event.pointer.point, vertex, true );
      },
      end: function( event ) {
        vertex.draggable && circuitNode.endDrag( event, vertex );

        // Only show on a tap, not on every drag.
        if ( vertex.interactive && event.pointer.point.distance( p ) < CircuitConstructionKitConstants.tapThreshold ) {

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

    // Use a query parameter to turn on node voltage readouts for debugging.  In #22 we are discussing making this
    // a user-visible option.
    var showNodeVoltages = phet.chipper.getQueryParameter( 'showNodeVoltages' );
    if ( showNodeVoltages ) {
      var voltageReadoutText = new Text( '', {
        fontSize: 18,
        y: -60,
        pickable: false
      } );
      this.addChild( voltageReadoutText );
      var updateReadoutTextLocation = function() {
        voltageReadoutText.centerX = dottedLineNode.centerX;
        voltageReadoutText.bottom = dottedLineNode.top - 10;
      };
      vertex.voltageProperty.link( function( voltage ) {
        voltageReadoutText.setText( Util.toFixed( voltage, 3 ) + 'V' );
        updateReadoutTextLocation();
      } );
    }

    var updateCutButtonPosition = function() {
      var position = vertex.position;

      var neighbors = circuit.getNeighborCircuitElements( vertex );

      // Compute an unweighted sum of adjacent element directions, and point in the opposite direction
      // so the button will appear in the least populated area.
      var sumOfDirections = new Vector2();
      for ( var i = 0; i < neighbors.length; i++ ) {
        var v = vertex.position.minus( neighbors[ i ].getOppositeVertex( vertex ).position );
        if ( v.magnitude() > 0 ) {
          var vector = v.normalized();
          sumOfDirections.add( vector );
        }
      }
      if ( sumOfDirections.magnitude() < 1E-6 ) {
        sumOfDirections = new Vector2( 0, -1 ); // Show the scissors above
      }
      cutButton.center = position.plus( sumOfDirections.normalized().timesScalar( DISTANCE_TO_CUT_BUTTON ) );
    };
    var updateVertexNodePosition = function( position ) {
      dottedLineNode.center = position;
      highlightNode.center = position;
      updateReadoutTextLocation && updateReadoutTextLocation();
      updateCutButtonPosition();
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    this.disposeVertexNode = function() {
      if ( simpleDragHandler.dragging ) {
        simpleDragHandler.endDrag();
      }
      vertex.positionProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateSelected );
      vertex.interactiveProperty.unlink( updatePickable );
      vertex.moveToFrontEmitter.removeListener( updateMoveToFront );

      circuitNode.highlightLayer.removeChild( highlightNode );
    };
  }

  circuitConstructionKit.register( 'VertexNode', VertexNode );

  return inherit( Node, VertexNode, {
    dispose: function() {
      this.disposeVertexNode();
    }
  } );
} );