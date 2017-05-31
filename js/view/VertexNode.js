// Copyright 2015-2017, University of Colorado Boulder

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

  // constants
  var DISTANCE_TO_CUT_BUTTON = 70; // How far in view coordinates the cut button appears from the vertex node

  /**
   * @param {CircuitNode} circuitNode - the entire CircuitNode
   * @param {Vertex} vertex - the Vertex that will be displayed
   * @param {Tandem} tandem
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

    // Highlight is shown when the vertex is selected.
    var highlightNode = new Circle( 30, {
      stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false
    } );

    // Shows up as red when disconnected or black when connected.  When unattachable, the dotted line disappears (black
    // box study)
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

    // Button shown when the vertex is attached to >1 circuit element that allows detaching.
    var cutButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: new FontAwesomeNode( 'cut', {
        rotation: -Math.PI / 2, // scissors point up
        scale: CircuitConstructionKitConstants.FONT_AWESOME_ICON_SCALE
      } ),
      minXMargin: 10,
      minYMargin: 10,
      listener: function() { circuit.cutVertex( vertex ); },
      tandem: tandem.createTandem( 'cutButton' )
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
      children: [ dottedLineNode ],
      tandem: tandem
    } );
    circuitNode.highlightLayer.addChild( highlightNode );
    circuitNode.buttonLayer.addChild( cutButton );

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
        vertex.draggableProperty.get() && circuitNode.startDragVertex( event.pointer.point, vertex, true );
        dragged = false;
      },
      drag: function( event ) {
        dragged = true;
        vertex.draggableProperty.get() && circuitNode.dragVertex( event.pointer.point, vertex, true );
      },
      end: function( event ) {

        // The vertex can only connect to something if it was actually moved.
        vertex.draggableProperty.get() && circuitNode.endDrag( event, vertex, dragged );

        // Only show on a tap, not on every drag.
        if ( vertex.interactiveProperty.get() && event.pointer.point.distance( eventPoint ) < CircuitConstructionKitConstants.TAP_THRESHOLD ) {

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
    dottedLineNode.addInputListener( dragHandler );

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
        voltageReadoutText.centerX = dottedLineNode.centerX;
        voltageReadoutText.bottom = dottedLineNode.top - 10;
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
      var bounds = circuitNode.visibleBoundsInCircuitCoordinateFrameProperty.get();

      var availableBounds = bounds.eroded( cutButton.width / 2 );
      cutButton.center = availableBounds.closestPointTo( proposedPosition );
    };
    var updateVertexNodePosition = function( position ) {
      dottedLineNode.center = position;
      highlightNode.center = position;
      updateReadoutTextLocation && updateReadoutTextLocation();
      updateCutButtonPosition();
    };
    vertex.positionProperty.link( updateVertexNodePosition );

    // @private
    this.disposeVertexNode = function() {
      vertex.positionProperty.unlink( updateVertexNodePosition );
      vertex.selectedProperty.unlink( updateSelected );
      vertex.interactiveProperty.unlink( updatePickable );
      vertex.relayerEmitter.removeListener( updateMoveToFront );

      circuitNode.highlightLayer.removeChild( highlightNode );
      circuitNode.buttonLayer.removeChild( cutButton );

      circuit.vertices.removeItemAddedListener( updateStroke );
      circuit.vertices.removeItemRemovedListener( updateStroke );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateStroke );
      circuit.circuitElements.removeItemRemovedListener( updateStroke );

      vertex.attachableProperty.unlink( updateStroke );
      circuit.circuitChangedEmitter.removeListener( updateStroke );
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
      Node.prototype.dispose.call( this );
      this.disposeVertexNode();
    }
  } );
} );