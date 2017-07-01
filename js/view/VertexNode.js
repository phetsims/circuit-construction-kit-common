// Copyright 2016-2017, University of Colorado Boulder

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
  var CircuitConstructionKitQueryParameters =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Input = require( 'SCENERY/input/Input' );

  // constants
  var DISTANCE_TO_CUT_BUTTON = 70; // How far in view coordinates the cut button appears from the vertex node
  var VERTEX_RADIUS = 16; // for hit testing with probes
  var CUT_ICON = new FontAwesomeNode( 'cut', {
    rotation: -Math.PI / 2, // scissors point up
    scale: CircuitConstructionKitConstants.FONT_AWESOME_ICON_SCALE
  } );

  // rasterize the images for the red and black dotted lines so they can be rendered with WebGL to improve performance
  var CIRCLE_OPTIONS = {
    lineWidth: 1.3,
    lineDash: [ 6, 4 ]
  };
  var RED_CIRCLE_NODE = new Circle( VERTEX_RADIUS, _.extend( CIRCLE_OPTIONS, {
    stroke: 'red'
  } ) ).toDataURLNodeSynchronous();
  var BLACK_CIRCLE_NODE = new Circle( VERTEX_RADIUS, _.extend( CIRCLE_OPTIONS, {
    stroke: 'black'
  } ) ).toDataURLNodeSynchronous();

  // When a vertex is selected, a cut button is shown near to the vertex.  If the vertex is connected to >1 circuit
  // element, the button is enabled.  Pressing the button will cut the vertex from the neighbors.  Only one cutButton
  // is allocated for all vertices to use because it is too performance demanding to create these dynamically when
  // circuit elements are dragged from the toolbox.
  var cutButton = new RoundPushButton( {
    baseColor: 'yellow',
    content: CUT_ICON,
    minXMargin: 10,
    minYMargin: 10,
    tandem: Tandem.createStaticTandem( 'cutButton' )
  } );

  var cutButtonInitialized = false;

  /**
   * @param {CircuitLayerNode} circuitLayerNode - the entire CircuitLayerNode
   * @param {Vertex} vertex - the Vertex that will be displayed
   * @param {Tandem} tandem
   * @constructor
   */
  function VertexNode( circuitLayerNode, vertex, tandem ) {

    // @private - Keep track of when the node has been dispose to prevent memory leaks, see usage below
    this.disposed = false;

    var self = this;
    var circuit = circuitLayerNode.circuit;

    // Take care to only initialize the cutButton once because it will be used for all VertexNode instance.  This must
    // happen after the circuit is available.
    if ( !cutButtonInitialized ) {
      cutButton.addListener( function() {
        circuit.cutVertex( circuit.getSelectedVertex() );
      } );
      cutButtonInitialized = true;
    }

    // @public (read-only) {Vertex} - the vertex associated with this node
    this.vertex = vertex;

    // @public (read-only) {Vector2} - added by CircuitLayerNode during dragging, used for relative drag location.
    this.startOffset = null;

    // Highlight is shown when the vertex is selected.
    var highlightNode = new Circle( 30, {
      stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH,
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
    var clickToDismissListener = null;
    var rootNode = null;
    var dragHandler = new TandemSimpleDragHandler( {
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
             event.pointer.point.distance( eventPoint ) < CircuitConstructionKitConstants.TAP_THRESHOLD ) {

          vertex.selectedProperty.set( true );

          rootNode = self.getUniqueTrail().rootNode();

          // listener for 'click outside to dismiss'
          clickToDismissListener = {
            down: function( event ) {

              // When tapping on the same vertex, just leave it selected
              var trails = event.target.getTrails( function( node ) {

                // When tapping on the selected vertex, leave it selected
                // When tapping on the associated cut button, don't dismiss it (before it can be activated)
                return node === self || node === cutButton;
              } );

              // If the user tapped anything except the vertex, then hide the highlight and cut button
              if ( trails.length === 0 ) {
                clickToDismissListener && rootNode.removeInputListener( clickToDismissListener );
                vertex.selectedProperty.set( false );
                clickToDismissListener = null;
              }
            }
          };
          rootNode.addInputListener( clickToDismissListener );
        }
        else {

          // Deselect after dragging so a grayed-out cut button doesn't remain when open vertex is connected
          clickToDismissListener && rootNode.removeInputListener( clickToDismissListener );
          vertex.selectedProperty.set( false );
          clickToDismissListener = null;
        }
      }
    } );

    // Don't permit dragging by the scissors or highlight
    self.addInputListener( dragHandler );

    // Use a query parameter to turn on node voltage readouts for debugging only.
    var vertexDisplay = CircuitConstructionKitQueryParameters.vertexDisplay;
    if ( vertexDisplay ) {
      var voltageReadoutText = new Text( '', {
        fontSize: 18,
        y: -60,
        pickable: false
      } );
      this.addChild( voltageReadoutText );
      var updateReadoutTextLocation = function() {
        voltageReadoutText.centerX = self.centerX;
        voltageReadoutText.bottom = self.top - 10;
      };
      vertex.voltageProperty.link( function( voltage ) {
        var voltageText = Util.toFixed( voltage, 3 ) + 'V';
        voltageReadoutText.setText( vertexDisplay === 'voltage' ? voltageText : vertex.index );
        updateReadoutTextLocation();
      } );
    }

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
    };
  }

  circuitConstructionKitCommon.register( 'VertexNode', VertexNode );

  return inherit( Node, VertexNode, {

    /**
     * Dispose resources when no longer used.
     * @public
     */
    dispose: function() {
      this.disposed = true;
      this.removeAllChildren();
      this.disposeVertexNode();
      Node.prototype.dispose.call( this );
    }
  }, {
    VERTEX_RADIUS: VERTEX_RADIUS,

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public
     */
    webglSpriteNodes: [
      BLACK_CIRCLE_NODE, RED_CIRCLE_NODE
    ]
  } );
} );