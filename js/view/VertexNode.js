// Copyright 2016-2017, University of Colorado Boulder

/**
 * The interactive scenery node for a vertex in the circuit graph.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const DISTANCE_TO_CUT_BUTTON = 70; // How far in view coordinates the cut button appears from the vertex node
  const VERTEX_RADIUS = 16; // for hit testing with probes

  // rasterize the images for the red and black dotted lines so they can be rendered with WebGL to improve performance
  const CIRCLE_OPTIONS = {
    lineWidth: 1.3,
    lineDash: [ 6, 4 ]
  };
  const RED_CIRCLE_NODE = new Circle( VERTEX_RADIUS, _.extend( CIRCLE_OPTIONS, {
    stroke: Color.RED
  } ) ).toDataURLImageSynchronous();
  const BLACK_CIRCLE_NODE = new Circle( VERTEX_RADIUS, _.extend( CIRCLE_OPTIONS, {
    stroke: Color.BLACK
  } ) ).toDataURLImageSynchronous();

  /**
   * @param {CircuitLayerNode} circuitLayerNode - the entire CircuitLayerNode
   * @param {Vertex} vertex - the Vertex that will be displayed
   * @param {Tandem} tandem
   * @constructor
   */
  function VertexNode( circuitLayerNode, vertex, tandem ) {
    const circuit = circuitLayerNode.circuit;

    // @private {Circuit}
    this.circuit = circuit;
    const cutButton = circuitLayerNode.cutButton;

    // @private {RoundPushButton}
    this.cutButton = cutButton;

    // @private {Tandem}
    this.vertexNodeTandem = tandem;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // Use a query parameter to turn on node voltage readouts for debugging only.
    const vertexDisplay = CCKCQueryParameters.vertexDisplay;

    // @private {Text} display for debugging only
    this.voltageReadoutText = null;
    if ( vertexDisplay ) {
      this.voltageReadoutText = new Text( '', {
        fontSize: 18,
        pickable: false
      } );

      // @private {function} for debugging
      this.updateReadoutTextLocation = () => {
        this.voltageReadoutText.centerX = 0;
        this.voltageReadoutText.bottom = -30;
      };
      vertex.voltageProperty.link( voltage => {

        // No need for i18n because this is for debugging only
        const voltageText = Util.toFixed( voltage, 3 ) + 'V';
        this.voltageReadoutText.setText( vertexDisplay === 'voltage' ? voltageText : vertex.index );
        this.updateReadoutTextLocation();
      } );
    }

    // @public (read-only) {Vertex} - the vertex associated with this node
    this.vertex = vertex;

    // @public (read-only) {Vector2|null} - added by CircuitLayerNode during dragging, used for relative drag location,
    // or null if not being dragged.
    this.startOffset = null;

    // @private {Circle} - Highlight is shown when the vertex is selected.
    this.highlightNode = new Circle( 30, {
      stroke: CCKCConstants.HIGHLIGHT_COLOR,
      lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false
    } );

    Node.call( this, {
      tandem: tandem,
      cursor: 'pointer',

      // keyboard navigation
      tagName: 'div', // HTML tag name for representative element in the document, see Accessibility.js
      focusable: true,
      focusHighlight: 'invisible' // highlights are drawn by the simulation, invisible is deprecated don't use in future
    } );

    // @private - keyboard listener so that delete or backspace deletes the element - must be disposed
    this.keyListener = {
      keydown: this.keydownListener.bind( this )
    };
    this.addInputListener( this.keyListener );

    // @private {function} Shows up as red when disconnected or black when connected.  When unattachable, the dotted line disappears (black
    // box study)
    this.updateStrokeListener = this.updateStroke.bind( this );

    // Update when any vertex is added or removed, or when the existing circuit values change.
    circuit.vertices.addItemAddedListener( this.updateStrokeListener );
    circuit.vertices.addItemRemovedListener( this.updateStrokeListener );
    circuit.circuitChangedEmitter.addListener( this.updateStrokeListener );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( this.updateStrokeListener );
    circuit.circuitElements.addItemRemovedListener( this.updateStrokeListener );

    vertex.attachableProperty.link( this.updateStrokeListener );

    // @private {function}
    this.updateSelectedListener = this.updateSelected.bind( this );
    vertex.selectedProperty.link( this.updateSelectedListener );

    // @private {function}
    this.updateMoveToFront = this.moveToFront.bind( this );
    vertex.relayerEmitter.addListener( this.updateMoveToFront );

    // @private {function}
    this.updatePickableListener = this.setPickable.bind( this );
    vertex.interactiveProperty.link( this.updatePickableListener );

    let eventPoint = null;
    let dragged = false;

    // @private {function[]} - called when the user clicks away from the selected vertex
    this.clickToDismissListeners = [];

    // @private {SimpleDragHandler}
    this.dragHandler = new SimpleDragHandler( {
      allowTouchSnag: true,
      tandem: tandem.createTandem( 'dragHandler' ),
      start: event => {
        eventPoint = event.pointer.point;
        circuitLayerNode.startDragVertex( event.pointer.point, vertex, true );
        dragged = false;
      },
      drag: event => {
        dragged = true;
        circuitLayerNode.dragVertex( event.pointer.point, vertex, true );
      },
      end: event => {

        // The vertex can only connect to something if it was actually moved.
        circuitLayerNode.endDrag( event, vertex, dragged );

        // Only show on a tap, not on every drag.
        if ( vertex.interactiveProperty.get() && event.pointer.point.distance( eventPoint ) < CCKCConstants.TAP_THRESHOLD ) {

          vertex.selectedProperty.set( true );

          const clickToDismissListener = {
            down: event => {
              if ( !_.includes( event.trail.nodes, this ) && !_.includes( event.trail.nodes, cutButton ) ) {
                vertex.selectedProperty.set( false );
                this.clearClickListeners();
              }
            }
          };
          phet.joist.sim.display.addInputListener( clickToDismissListener );
          this.clickToDismissListeners.push( clickToDismissListener );
        }
        else {

          // Deselect after dragging so a grayed-out cut button doesn't remain when open vertex is connected
          vertex.selectedProperty.set( false );
          this.clearClickListeners();
        }
      }
    } );
    this.dragHandler.startDrag = function( event ) {
      if ( circuitLayerNode.canDragVertex( vertex ) ) {
        circuitLayerNode.setVerticesDragging( vertex );
        SimpleDragHandler.prototype.startDrag.call( this, event );
      }
    };

    // @private {function} When Vertex becomes undraggable, interrupt the input listener
    this.interruptionListener = this.setDraggable.bind( this );
    vertex.draggableProperty.lazyLink( this.interruptionListener );

    // Don't permit dragging by the scissors or highlight
    this.addInputListener( this.dragHandler );

    // Make sure the cut button remains in the visible screen bounds.
    this.updateVertexNodePositionListener = this.updateVertexNodePosition.bind( this );
    vertex.positionProperty.link( this.updateVertexNodePositionListener );

    // When showing the highlight, make sure it shows in the right place (not updated while invisible)
    vertex.selectedProperty.link( this.updateVertexNodePositionListener );
  }

  circuitConstructionKitCommon.register( 'VertexNode', VertexNode );

  return inherit( Node, VertexNode, {

    /**
     * Dispose resources when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      const vertex = this.vertex;
      const circuit = this.circuit;
      const cutButton = this.circuitLayerNode.cutButton;
      const circuitLayerNode = this.circuitLayerNode;
      vertex.positionProperty.unlink( this.updateVertexNodePositionListener );
      vertex.selectedProperty.unlink( this.updateVertexNodePositionListener );
      vertex.selectedProperty.unlink( this.updateSelectedListener );
      vertex.interactiveProperty.unlink( this.updatePickableListener );
      vertex.relayerEmitter.removeListener( this.updateMoveToFront );
      CCKCUtil.setInSceneGraph( false, circuitLayerNode.buttonLayer, cutButton );
      CCKCUtil.setInSceneGraph( false, circuitLayerNode.highlightLayer, this.highlightNode );
      circuit.vertices.removeItemAddedListener( this.updateStrokeListener );
      circuit.vertices.removeItemRemovedListener( this.updateStrokeListener );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( this.updateStrokeListener );
      circuit.circuitElements.removeItemRemovedListener( this.updateStrokeListener );

      vertex.attachableProperty.unlink( this.updateStrokeListener );
      circuit.circuitChangedEmitter.removeListener( this.updateStrokeListener );

      this.removeInputListener( this.keyListener );

      // Remove the global listener if it was still enabled
      this.clearClickListeners();

      this.dragHandler.dispose();
      this.removeInputListener( this.dragHandler );

      vertex.draggableProperty.unlink( this.interruptionListener );
      Node.prototype.dispose.call( this );
    },

    /**
     * @param {Event} event - scenery keyboard event
     * @private
     */
    keydownListener: function( event ) {
      const domEvent = event.domEvent;
      const code = domEvent.keyCode || domEvent.which;

      // on delete or backspace, the focused Vertex should be cut
      if ( code === KeyboardUtil.KEY_DELETE || code === KeyboardUtil.KEY_BACKSPACE ) {

        // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/307
        domEvent.preventDefault();
        this.cutButton.enabled && this.circuit.cutVertex( this.circuit.getSelectedVertex() );
      }
    },

    /**
     * Update whether the vertex is shown as selected.
     * @param selected
     */
    updateSelected: function( selected ) {
      const neighborCircuitElements = this.circuit.getNeighborCircuitElements( this.vertex );

      if ( selected ) {

        // Adjacent components should be in front of the vertex, see #20
        for ( let i = 0; i < neighborCircuitElements.length; i++ ) {
          neighborCircuitElements[ i ].vertexSelectedEmitter.emit();
        }
        this.moveToFront();
        this.focus();
      }
      CCKCUtil.setInSceneGraph( selected, this.circuitLayerNode.highlightLayer, this.highlightNode );
      const numberConnections = neighborCircuitElements.length;
      CCKCUtil.setInSceneGraph( selected, this.circuitLayerNode.buttonLayer, this.cutButton );
      selected && this.updateCutButtonPosition();

      // Show a disabled button as a cue that the vertex could be cuttable, but it isn't right now.
      const isConnectedBlackBoxVertex = numberConnections === 1 && !this.vertex.draggableProperty.get();
      this.cutButton.enabled = numberConnections > 1 || isConnectedBlackBoxVertex;
    },

    /**
     * Update the stroke
     * @private
     */
    updateStroke: function() {

      // A memory leak was being caused by children getting added after dispose was called.
      // This is because the itemRemoved listener in CircuitLayerNode is added (and hence called) before this callback.
      // The CircuitLayerNode listener calls dispose but this listener still gets called back because emitter gets
      // a defensive copy of listeners.
      if ( !this.disposed ) {

        const desiredChild = this.circuit.countCircuitElements( this.vertex ) > 1 ? BLACK_CIRCLE_NODE : RED_CIRCLE_NODE;
        if ( this.getChildAt( 0 ) !== desiredChild ) {
          this.children = this.voltageReadoutText ? [ desiredChild, this.voltageReadoutText ] : [ desiredChild ];
        }
        this.visible = this.vertex.attachableProperty.get();
      }
    },

    /**
     * @private - update the position of the cut button
     */
    updateCutButtonPosition: function() {
      const position = this.vertex.positionProperty.get();

      const neighbors = this.circuit.getNeighborCircuitElements( this.vertex );

      // Compute an unweighted sum of adjacent element directions, and point in the opposite direction so the button
      // will appear in the least populated area.
      const sumOfDirections = new Vector2();
      for ( let i = 0; i < neighbors.length; i++ ) {
        const v = this.vertex.positionProperty.get().minus(
          neighbors[ i ].getOppositeVertex( this.vertex ).positionProperty.get()
        );
        if ( v.magnitude() > 0 ) {
          sumOfDirections.add( v.normalized() );
        }
      }
      if ( sumOfDirections.magnitude() < 1E-6 ) {
        sumOfDirections.setXY( 0, -1 ); // Show the scissors above
      }

      const proposedPosition = position.plus( sumOfDirections.normalized().timesScalar( DISTANCE_TO_CUT_BUTTON ) );

      // Property doesn't exist until the node is attached to scene graph
      const bounds = this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty.get();

      const availableBounds = bounds.eroded( this.cutButton.width / 2 );
      this.cutButton.center = availableBounds.closestPointTo( proposedPosition );
    },

    /**
     * Move the VertexNode when the Vertex moves.
     * @private
     */
    updateVertexNodePosition: function() {
      const position = this.vertex.positionProperty.get();
      this.translation = position;

      // Update the position of the highlight, but only if it is visible
      if ( this.vertex.selectedProperty.get() ) {
        this.highlightNode.translation = position;
      }
      this.updateReadoutTextLocation && this.updateReadoutTextLocation();

      // Update the cut button position, but only if the cut button is showing (to save on CPU)
      this.vertex.selectedProperty.get() && this.updateCutButtonPosition();
    },

    /**
     * Remove click listeners
     * @private
     */
    clearClickListeners: function() {
      this.clickToDismissListeners.forEach( listener => phet.joist.sim.display.removeInputListener( listener ) );
      this.clickToDismissListeners.length = 0;
    },

    /**
     * Sets whether the node is draggable, used as a callback for interrupting the drag listener
     * @param {boolean} draggable
     * @private
     */
    setDraggable: function( draggable ) {
      if ( !draggable ) {
        this.dragHandler.interrupt();
      }
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