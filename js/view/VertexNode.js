// Copyright 2016-2017, University of Colorado Boulder

/**
 * The interactive scenery node for a vertex in the circuit graph.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitCommonQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonQueryParameters' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Input = require( 'SCENERY/input/Input' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );

  // constants
  var DISTANCE_TO_CUT_BUTTON = 70; // How far in view coordinates the cut button appears from the vertex node
  var VERTEX_RADIUS = 16; // for hit testing with probes

  // rasterize the images for the red and black dotted lines so they can be rendered with WebGL to improve performance
  var CIRCLE_OPTIONS = {
    lineWidth: 1.3,
    lineDash: [ 6, 4 ]
  };
  var RED_CIRCLE_NODE = new Circle( VERTEX_RADIUS, _.extend( CIRCLE_OPTIONS, {
    stroke: Color.RED
  } ) ).toDataURLImageSynchronous();
  var BLACK_CIRCLE_NODE = new Circle( VERTEX_RADIUS, _.extend( CIRCLE_OPTIONS, {
    stroke: Color.BLACK
  } ) ).toDataURLImageSynchronous();

  /**
   * @param {CircuitLayerNode} circuitLayerNode - the entire CircuitLayerNode
   * @param {Vertex} vertex - the Vertex that will be displayed
   * @param {Tandem} tandem
   * @constructor
   */
  function VertexNode( circuitLayerNode, vertex, tandem ) {

    var self = this;
    var circuit = circuitLayerNode.circuit;
    var cutButton = circuitLayerNode.cutButton;

    // Use a query parameter to turn on node voltage readouts for debugging only.
    var vertexDisplay = CircuitConstructionKitCommonQueryParameters.vertexDisplay;
    var voltageReadoutText = null;
    if ( vertexDisplay ) {
      voltageReadoutText = new Text( '', {
        fontSize: 18,
        pickable: false
      } );
      var updateReadoutTextLocation = function() {
        voltageReadoutText.centerX = 0;
        voltageReadoutText.bottom = -30;
      };
      vertex.voltageProperty.link( function( voltage ) {
        var voltageText = Util.toFixed( voltage, 3 ) + 'V';
        voltageReadoutText.setText( vertexDisplay === 'voltage' ? voltageText : vertex.index );
        updateReadoutTextLocation();
      } );
    }

    // @public (read-only) {Vertex} - the vertex associated with this node
    this.vertex = vertex;

    // @public (read-only) {Vector2|null} - added by CircuitLayerNode during dragging, used for relative drag location,
    // or null if not being dragged.
    this.startOffset = null;

    // Highlight is shown when the vertex is selected.
    var highlightNode = new Circle( 30, {
      stroke: CircuitConstructionKitCommonConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitCommonConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false
    } );

    Node.call( this, {
      tandem: tandem,
      cursor: 'pointer',

      // keyboard navigation
      tagName: 'div', // HTML tag name for representative element in the document, see Accessibility.js
      focusable: true,
      focusHighlight: 'invisible' // highlights are drawn by the simulation
    } );

    // keyboard listener so that delete or backspace deletes the element - must be disposed
    var keyListener = this.addAccessibleInputListener( {
      keydown: function( event ) {
        var code = event.keyCode || event.which;

        // on delete or backspace, the focused Vertex should be cut
        if ( code === Input.KEY_DELETE || code === Input.KEY_BACKSPACE ) {

          // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/307
          event.preventDefault();
          cutButton.enabled && circuit.cutVertex( circuit.getSelectedVertex() );
        }
      }
    } );

    // Shows up as red when disconnected or black when connected.  When unattachable, the dotted line disappears (black
    // box study)
    var updateStroke = function() {

      // A memory leak was being caused by children getting added after dispose was called.
      // This is because the itemRemoved listener in CircuitLayerNode is added (and hence called) before this callback.
      // The CircuitLayerNode listener calls dispose but this listener still gets called back because emitter gets
      // a defensive copy of listeners.
      if ( self.disposed ) {
        return;
      }
      var desiredChild = circuit.countCircuitElements( vertex ) > 1 ? BLACK_CIRCLE_NODE : RED_CIRCLE_NODE;
      if ( self.getChildAt( 0 ) !== desiredChild ) {
        self.children = [ desiredChild ];
        voltageReadoutText && self.addChild( voltageReadoutText );
      }
      self.visible = vertex.attachableProperty.get();
    };

    // Update when any vertex is added or removed, or when the existing circuit values change.
    circuit.vertices.addItemAddedListener( updateStroke );
    circuit.vertices.addItemRemovedListener( updateStroke );
    circuit.circuitChangedEmitter.addListener( updateStroke );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateStroke );
    circuit.circuitElements.addItemRemovedListener( updateStroke );

    vertex.attachableProperty.link( updateStroke );

    var updateSelected = function( selected ) {
      var neighborCircuitElements = circuit.getNeighborCircuitElements( vertex );

      if ( selected ) {

        // Adjacent components should be in front of the vertex, see #20
        for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
          neighborCircuitElements[ i ].vertexSelectedEmitter.emit();
        }
        self.moveToFront();
        self.focus();
      }
      CircuitConstructionKitCommonUtil.setInSceneGraph( selected, circuitLayerNode.highlightLayer, highlightNode );
      var numberConnections = neighborCircuitElements.length;
      CircuitConstructionKitCommonUtil.setInSceneGraph( selected, circuitLayerNode.buttonLayer, cutButton );
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

    var updatePickable = function( interactive ) { self.pickable = interactive; };
    vertex.interactiveProperty.link( updatePickable );

    var eventPoint = null;
    var dragged = false;
    var clickToDismissListeners = [];
    var clearClickListeners = function() {
      clickToDismissListeners.forEach( function( listener ) {
        phet.joist.sim.display.removeInputListener( listener );
      } );
      clickToDismissListeners.length = 0;
    };
    var dragHandler = new SimpleDragHandler( {
      allowTouchSnag: true,
      tandem: tandem.createTandem( 'dragHandler' ),
      start: function( event ) {
        eventPoint = event.pointer.point;
        vertex.draggableProperty.get() && circuitLayerNode.startDragVertex( event.pointer.point, vertex, true );
        dragged = false;
      },
      drag: function( event ) {
        dragged = true;
        vertex.draggableProperty.get() && circuitLayerNode.dragVertex( event.pointer.point, vertex, true );
      },
      end: function( event ) {

        // The vertex can only connect to something if it was actually moved.
        vertex.draggableProperty.get() && circuitLayerNode.endDrag( event, vertex, dragged );

        // Only show on a tap, not on every drag.
        if ( vertex.interactiveProperty.get() &&
             event.pointer.point.distance( eventPoint ) < CircuitConstructionKitCommonConstants.TAP_THRESHOLD ) {

          vertex.selectedProperty.set( true );

          var clickToDismissListener = {
            down: function( event ) {
              if ( !_.includes( event.trail.nodes, self ) && !_.includes( event.trail.nodes, cutButton ) ) {
                vertex.selectedProperty.set( false );
                clearClickListeners();
              }
            }
          };
          phet.joist.sim.display.addInputListener( clickToDismissListener );
          clickToDismissListeners.push( clickToDismissListener );
        }
        else {

          // Deselect after dragging so a grayed-out cut button doesn't remain when open vertex is connected
          vertex.selectedProperty.set( false );
          clearClickListeners();
        }
      }
    } );

    // Don't permit dragging by the scissors or highlight
    this.addInputListener( dragHandler );

    // Make sure the cut button remains in the visible screen bounds.
    var updateCutButtonPosition = function() {
      var position = vertex.positionProperty.get();

      var neighbors = circuit.getNeighborCircuitElements( vertex );

      // Compute an unweighted sum of adjacent element directions, and point in the opposite direction so the button
      // will appear in the least populated area.
      var sumOfDirections = new Vector2();
      for ( var i = 0; i < neighbors.length; i++ ) {
        var v = vertex.positionProperty.get().minus(
          neighbors[ i ].getOppositeVertex( vertex ).positionProperty.get()
        );
        if ( v.magnitude() > 0 ) {
          sumOfDirections.add( v.normalized() );
        }
      }
      if ( sumOfDirections.magnitude() < 1E-6 ) {
        sumOfDirections = new Vector2( 0, -1 ); // Show the scissors above
      }

      var proposedPosition = position.plus( sumOfDirections.normalized().timesScalar( DISTANCE_TO_CUT_BUTTON ) );

      // Property doesn't exist until the node is attached to scene graph
      var bounds = circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty.get();

      var availableBounds = bounds.eroded( cutButton.width / 2 );
      cutButton.center = availableBounds.closestPointTo( proposedPosition );
    };
    var updateVertexNodePosition = function() {
      var position = vertex.positionProperty.get();
      self.setTranslation( position.x, position.y );

      // Update the position of the highlight, but only if it is visible
      if ( vertex.selectedProperty.get() ) {
        highlightNode.translation = position;
      }
      updateReadoutTextLocation && updateReadoutTextLocation();

      // Update the cut button position, but only if the cut button is showing (to save on CPU)
      vertex.selectedProperty.get() && updateCutButtonPosition();
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    // When showing the highlight, make sure it shows in the right place (not updated while invisible)
    vertex.selectedProperty.link( updateVertexNodePosition );

    // @private
    this.disposeVertexNode = function() {
      vertex.positionProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateSelected );
      vertex.interactiveProperty.unlink( updatePickable );
      vertex.relayerEmitter.removeListener( updateMoveToFront );
      CircuitConstructionKitCommonUtil.setInSceneGraph( false, circuitLayerNode.buttonLayer, cutButton );
      CircuitConstructionKitCommonUtil.setInSceneGraph( false, circuitLayerNode.highlightLayer, highlightNode );
      circuit.vertices.removeItemAddedListener( updateStroke );
      circuit.vertices.removeItemRemovedListener( updateStroke );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateStroke );
      circuit.circuitElements.removeItemRemovedListener( updateStroke );

      vertex.attachableProperty.unlink( updateStroke );
      circuit.circuitChangedEmitter.removeListener( updateStroke );

      this.removeAccessibleInputListener( keyListener );
      tandem.removeInstance( self );

      // Remove the global listener if it was still enabled
      clearClickListeners();

      dragHandler.dispose();
      this.removeInputListener( dragHandler );
    };
  }

  circuitConstructionKitCommon.register( 'VertexNode', VertexNode );

  return inherit( Node, VertexNode, {

    /**
     * Dispose resources when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeVertexNode();
      Node.prototype.dispose.call( this );
    }
  }, {
    VERTEX_RADIUS: VERTEX_RADIUS,

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [
      BLACK_CIRCLE_NODE, RED_CIRCLE_NODE
    ]
  } );
} );