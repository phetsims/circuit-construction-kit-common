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

    // @private {Circuit}
    this.circuit = circuit;
    var cutButton = circuitLayerNode.cutButton;

    // @private {RoundPushButton}
    this.cutButton = cutButton;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // Use a query parameter to turn on node voltage readouts for debugging only.
    var vertexDisplay = CircuitConstructionKitCommonQueryParameters.vertexDisplay;

    // @private {Text} display for debugging only
    this.voltageReadoutText = null;
    if ( vertexDisplay ) {
      this.voltageReadoutText = new Text( '', {
        fontSize: 18,
        pickable: false
      } );
      var updateReadoutTextLocation = function() {
        self.voltageReadoutText.centerX = 0;
        self.voltageReadoutText.bottom = -30;
      };
      vertex.voltageProperty.link( function( voltage ) {

        // No need for i18n because this is for debugging only
        var voltageText = Util.toFixed( voltage, 3 ) + 'V';
        self.voltageReadoutText.setText( vertexDisplay === 'voltage' ? voltageText : vertex.index );
        updateReadoutTextLocation();
      } );
    }

    // @public (read-only) {Vertex} - the vertex associated with this node
    this.vertex = vertex;

    // @public (read-only) {Vector2|null} - added by CircuitLayerNode during dragging, used for relative drag location,
    // or null if not being dragged.
    this.startOffset = null;

    // @private {Circle} - Highlight is shown when the vertex is selected.
    this.highlightNode = new Circle( 30, {
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
      keydown: this.keydownListener.bind( this )
    } );

    // Shows up as red when disconnected or black when connected.  When unattachable, the dotted line disappears (black
    // box study)
    var updateStrokeListener = this.updateStroke.bind( this );

    // Update when any vertex is added or removed, or when the existing circuit values change.
    circuit.vertices.addItemAddedListener( updateStrokeListener );
    circuit.vertices.addItemRemovedListener( updateStrokeListener );
    circuit.circuitChangedEmitter.addListener( updateStrokeListener );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateStrokeListener );
    circuit.circuitElements.addItemRemovedListener( updateStrokeListener );

    vertex.attachableProperty.link( updateStrokeListener );

    var updateSelectedListener = this.updateSelected.bind( this );
    vertex.selectedProperty.link( updateSelectedListener );
    var updateMoveToFront = self.moveToFront.bind( this );
    vertex.relayerEmitter.addListener( updateMoveToFront );

    var updatePickable = this.setPickable.bind( this );
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
        circuitLayerNode.startDragVertex( event.pointer.point, vertex, true );
        dragged = false;
      },
      drag: function( event ) {
        dragged = true;
        circuitLayerNode.dragVertex( event.pointer.point, vertex, true );
      },
      end: function( event ) {

        // The vertex can only connect to something if it was actually moved.
        circuitLayerNode.endDrag( event, vertex, dragged );

        // Only show on a tap, not on every drag.
        if ( vertex.interactiveProperty.get() && event.pointer.point.distance( eventPoint ) < CircuitConstructionKitCommonConstants.TAP_THRESHOLD ) {

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

    // When Vertex becomes undraggable, interrupt the input listener
    var interruptionListener = function( draggable ) {
      if ( !draggable ) {
        dragHandler.interrupt();
      }
    };
    vertex.draggableProperty.lazyLink( interruptionListener );

    // Don't permit dragging by the scissors or highlight
    this.addInputListener( dragHandler );

    // Make sure the cut button remains in the visible screen bounds.
    var updateVertexNodePosition = function() {
      var position = vertex.positionProperty.get();
      self.translation = position;

      // Update the position of the highlight, but only if it is visible
      if ( vertex.selectedProperty.get() ) {
        self.highlightNode.translation = position;
      }
      updateReadoutTextLocation && updateReadoutTextLocation();

      // Update the cut button position, but only if the cut button is showing (to save on CPU)
      vertex.selectedProperty.get() && self.updateCutButtonPosition();
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    // When showing the highlight, make sure it shows in the right place (not updated while invisible)
    vertex.selectedProperty.link( updateVertexNodePosition );

    // @private
    //REVIEW*: Only if we have memory issues still, I'd recommend removing closures from VertexNode
    this.disposeVertexNode = function() {
      vertex.positionProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateSelectedListener );
      vertex.interactiveProperty.unlink( updatePickable );
      vertex.relayerEmitter.removeListener( updateMoveToFront );
      CircuitConstructionKitCommonUtil.setInSceneGraph( false, circuitLayerNode.buttonLayer, cutButton );
      CircuitConstructionKitCommonUtil.setInSceneGraph( false, circuitLayerNode.highlightLayer, self.highlightNode );
      circuit.vertices.removeItemAddedListener( updateStrokeListener );
      circuit.vertices.removeItemRemovedListener( updateStrokeListener );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateStrokeListener );
      circuit.circuitElements.removeItemRemovedListener( updateStrokeListener );

      vertex.attachableProperty.unlink( updateStrokeListener );
      circuit.circuitChangedEmitter.removeListener( updateStrokeListener );

      this.removeAccessibleInputListener( keyListener );
      tandem.removeInstance( self );

      // Remove the global listener if it was still enabled
      clearClickListeners();

      dragHandler.dispose();
      this.removeInputListener( dragHandler );

      vertex.draggableProperty.unlink( interruptionListener );
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
    },

    /**
     * @param {Event} event - scenery keyboard event
     * @private
     */
    keydownListener: function( event ) {
      var code = event.keyCode || event.which;

      // on delete or backspace, the focused Vertex should be cut
      if ( code === Input.KEY_DELETE || code === Input.KEY_BACKSPACE ) {

        // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/307
        event.preventDefault();
        this.cutButton.enabled && this.circuit.cutVertex( this.circuit.getSelectedVertex() );
      }
    },

    /**
     * Update whether the vertex is shown as selected.
     * @param selected
     */
    updateSelected: function( selected ) {
      var neighborCircuitElements = this.circuit.getNeighborCircuitElements( this.vertex );

      if ( selected ) {

        // Adjacent components should be in front of the vertex, see #20
        for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
          neighborCircuitElements[ i ].vertexSelectedEmitter.emit();
        }
        this.moveToFront();
        this.focus();
      }
      CircuitConstructionKitCommonUtil.setInSceneGraph( selected, this.circuitLayerNode.highlightLayer, this.highlightNode );
      var numberConnections = neighborCircuitElements.length;
      CircuitConstructionKitCommonUtil.setInSceneGraph( selected, this.circuitLayerNode.buttonLayer, this.cutButton );
      selected && this.updateCutButtonPosition();

      // Show a disabled button as a cue that the vertex could be cuttable, but it isn't right now.
      var isConnectedBlackBoxVertex = numberConnections === 1 && !this.vertex.draggableProperty.get();
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

        var desiredChild = this.circuit.countCircuitElements( this.vertex ) > 1 ? BLACK_CIRCLE_NODE : RED_CIRCLE_NODE;
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
      var position = this.vertex.positionProperty.get();

      var neighbors = this.circuit.getNeighborCircuitElements( this.vertex );

      // Compute an unweighted sum of adjacent element directions, and point in the opposite direction so the button
      // will appear in the least populated area.
      var sumOfDirections = new Vector2();
      for ( var i = 0; i < neighbors.length; i++ ) {
        var v = this.vertex.positionProperty.get().minus(
          neighbors[ i ].getOppositeVertex( this.vertex ).positionProperty.get()
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
      var bounds = this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty.get();

      var availableBounds = bounds.eroded( this.cutButton.width / 2 );
      this.cutButton.center = availableBounds.closestPointTo( proposedPosition );
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