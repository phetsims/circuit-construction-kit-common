// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The interactive scenery node for a vertex in the circuit graph.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // constants
  var DISTANCE_TO_CUT_BUTTON = 70; // How far (screen coordinates) the cut button appears from the vertex node

  /**
   * @constructor
   */
  function VertexNode( circuitNode, vertex, tandem ) {
    var self = this;
    var circuit = circuitNode.circuit;

    // @public (read-only) - the vertex associated with this node
    this.vertex = vertex;

    // @public (read-only) - added by CircuitNode during dragging, used for relative drag location.
    this.startOffset = null;

    // @public (read-only) - for hit testing with probes
    this.dottedLineNodeRadius = 16;

    // Start as a dotted line, becomes solid when connected to >1 element.
    var dottedLineNode = new Circle( this.dottedLineNodeRadius, {
      stroke: 'red',
      lineWidth: 1.3,
      lineDash: [ 6, 4 ],
      cursor: 'pointer'
    } );
    var highlightNode = new Circle( 30, {
      stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false
    } );

    var updateStroke = function() {
      dottedLineNode.stroke = circuit.countCircuitElements( vertex ) > 1 ? 'black' : 'red';
      dottedLineNode.visible = vertex.attachableProperty.get();
    };

    // Update when any vertex is added or removed, or when the existing circuit values change.
    circuit.vertices.addItemAddedListener( updateStroke );
    circuit.vertices.addItemRemovedListener( updateStroke );
    circuit.circuitChangedEmitter.addListener( updateStroke );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateStroke );
    circuit.circuitElements.addItemRemovedListener( updateStroke );

    vertex.attachableProperty.link( updateStroke );

    var cutButton = new RoundPushButton( {
      tandem: tandem.createTandem( 'cutButton' ),
      baseColor: 'yellow',
      content: new FontAwesomeNode( 'cut', {
        rotation: -Math.PI / 2, // scissors point up
        scale: CircuitConstructionKitConstants.FONT_AWESOME_ICON_SCALE
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

        self.moveToFront();
      }
      highlightNode.visible = selected;

      var numberConnections = neighborCircuitElements.length;
      cutButton.visible = selected;
      selected && updateCutButtonPosition();

      // Show a disabled button as a cue that the vertex could be cuttable, but it isn't right now.
      var isConnectedBlackBoxVertex = numberConnections === 1 && !self.vertex.draggableProperty.get();
      cutButton.enabled = numberConnections > 1 || isConnectedBlackBoxVertex;
    };
    vertex.selectedProperty.link( updateSelected );
    var updateMoveToFront = function() {
      self.moveToFront();
    };
    vertex.relayerEmitter.addListener( updateMoveToFront );
    Node.call( this, {
      children: [ dottedLineNode, cutButton ]
    } );
    circuitNode.highlightLayer.addChild( highlightNode );

    var updatePickable = function( interactive ) {
      self.pickable = interactive;
    };
    vertex.interactiveProperty.link( updatePickable );

    var p = null;
    var didDrag = false;
    var dragHandler = new TandemSimpleDragHandler( {
      allowTouchSnag: true,
      tandem: tandem.createTandem( 'dragHandler' ),
      start: function( event ) {
        p = event.pointer.point;
        vertex.draggableProperty.get() && circuitNode.startDrag( event.pointer.point, vertex, true );
        didDrag = false;
      },
      drag: function( event ) {
        didDrag = true;
        vertex.draggableProperty.get() && circuitNode.drag( event.pointer.point, vertex, true );
      },
      end: function( event ) {

        // The vertex can only connect to something if it was actually moved.
        vertex.draggableProperty.get() && circuitNode.endDrag( event, vertex, didDrag );

        // Only show on a tap, not on every drag.
        if ( vertex.interactiveProperty.get() && event.pointer.point.distance( p ) < CircuitConstructionKitConstants.TAP_THRESHOLD ) {

          vertex.selectedProperty.set( true );

          // When the user clicks on anything else, deselect the vertex
          var deselect = function() {
            vertex.selectedProperty.set( false );
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
    dottedLineNode.addInputListener( dragHandler );

    // Use a query parameter to turn on node voltage readouts for debugging.  In #22 we are discussing making this
    // a user-visible option.
    var vertexDisplay = CircuitConstructionKitQueryParameters.vertexDisplay;
    if ( vertexDisplay ) {
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
        var voltageText = Util.toFixed( voltage, 3 ) + 'V';
        voltageReadoutText.setText( vertexDisplay === 'voltage' ? voltageText : vertex.index );
        updateReadoutTextLocation();
      } );
    }

    var updateCutButtonPosition = function() {
      var position = vertex.positionProperty.get();

      var neighbors = circuit.getNeighborCircuitElements( vertex );

      // Compute an unweighted sum of adjacent element directions, and point in the opposite direction
      // so the button will appear in the least populated area.
      var sumOfDirections = new Vector2();
      for ( var i = 0; i < neighbors.length; i++ ) {
        var v = vertex.positionProperty.get().minus( neighbors[ i ].getOppositeVertex( vertex ).positionProperty.get() );
        if ( v.magnitude() > 0 ) {
          sumOfDirections.add( v.normalized() );
        }
      }
      if ( sumOfDirections.magnitude() < 1E-6 ) {
        sumOfDirections = new Vector2( 0, -1 ); // Show the scissors above
      }

      var proposedPosition = position.plus( sumOfDirections.normalized().timesScalar( DISTANCE_TO_CUT_BUTTON ) );

      // Property doesn't exist until the node is attached to scene graph
      if ( circuitNode.visibleBoundsInCircuitCoordinateFrameProperty ) {
        var bounds = circuitNode.visibleBoundsInCircuitCoordinateFrameProperty.get();

        var availableBounds = bounds.eroded( cutButton.width / 2 );
        var closestPoint = availableBounds.closestPointTo( proposedPosition );
        cutButton.center = closestPoint;
      }
    };
    var updateVertexNodePosition = function( position ) {
      dottedLineNode.center = position;
      highlightNode.center = position;
      updateReadoutTextLocation && updateReadoutTextLocation();
      updateCutButtonPosition();
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    this.disposeVertexNode = function() {
      if ( dragHandler.dragging ) {
        dragHandler.endDrag();
      }
      vertex.positionProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateSelected );
      vertex.interactiveProperty.unlink( updatePickable );
      vertex.relayerEmitter.removeListener( updateMoveToFront );

      circuitNode.highlightLayer.removeChild( highlightNode );

      circuit.vertices.removeItemAddedListener( updateStroke );
      circuit.vertices.removeItemRemovedListener( updateStroke );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateStroke );
      circuit.circuitElements.removeItemRemovedListener( updateStroke );

      vertex.attachableProperty.unlink( updateStroke );
      circuit.circuitChangedEmitter.removeListener( updateStroke );
      tandem.removeInstance( self );
    };

    tandem.addInstance( this, TNode );
  }

  circuitConstructionKitCommon.register( 'VertexNode', VertexNode );

  return inherit( Node, VertexNode, {
    dispose: function() {
      this.disposeVertexNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );