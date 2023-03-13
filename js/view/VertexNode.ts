// Copyright 2016-2023, University of Colorado Boulder

/**
 * The interactive scenery node for a vertex in the circuit graph.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Circle, CircleOptions, Color, Grayscale, Node, SceneryConstants, SceneryEvent, Text, VBox } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import Vertex from '../model/Vertex.js';
import CircuitNode from './CircuitNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';

// constants
const DISTANCE_TO_CUT_BUTTON = 70; // How far in view coordinates the cut button appears from the vertex node
const VERTEX_RADIUS = 16; // for hit testing with probes

// rasterize the images for the red and black dotted lines so they can be rendered with WebGL to improve performance
const CIRCLE_OPTIONS = {
  lineWidth: 1.3,
  lineDash: [ 6, 4 ]
};
const RED_CIRCLE_NODE = new Circle( VERTEX_RADIUS, combineOptions<CircleOptions>( CIRCLE_OPTIONS, {
  stroke: Color.RED
} ) ).rasterized( { wrap: false } );
const BLACK_CIRCLE_NODE = new Circle( VERTEX_RADIUS, combineOptions<CircleOptions>( CIRCLE_OPTIONS, {
  stroke: Color.BLACK
} ) ).rasterized( { wrap: false } );

export default class VertexNode extends Node {
  private readonly circuit: Circuit;
  private readonly vertexCutButtonContainer: Node;
  private readonly circuitNode: CircuitNode;
  private readonly vertexLabelNode: VBox;
  private readonly updateReadoutTextPosition: ( () => void );
  private readonly vertex: Vertex;

  // added by CircuitNode during dragging, used for relative drag position, or null if not being dragged
  public startOffset: Vector2 | null;
  private readonly highlightNode: Circle;
  private readonly updateStrokeListener: () => void;
  private readonly updateSelectedListener: () => void;
  protected readonly updateMoveToFront: () => Node;
  protected readonly updatePickableListener: ( pickable: boolean | null ) => Node;
  private readonly dragListener: CircuitNodeDragListener;
  private readonly interruptionListener: ( draggable: boolean ) => void;
  private readonly updateVertexNodePositionListener: () => void;
  public static readonly VERTEX_RADIUS = VERTEX_RADIUS;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static readonly webglSpriteNodes = [
    BLACK_CIRCLE_NODE, RED_CIRCLE_NODE
  ];

  /**
   * @param circuitNode - the entire CircuitNode
   * @param vertex - the Vertex that will be displayed
   * @param tandem
   */
  public constructor( circuitNode: CircuitNode, vertex: Vertex, tandem: Tandem ) {

    super( {
      tandem: tandem,
      cursor: 'pointer',

      // keyboard navigation
      tagName: 'div', // HTML tag name for representative element in the document, see ParallelDOM.js
      focusable: true,
      focusHighlight: 'invisible', // highlights are drawn by the simulation, invisible is deprecated don't use in future
      phetioDynamicElement: true,
      phetioVisiblePropertyInstrumented: false
    } );

    const circuit = circuitNode.circuit;

    this.circuit = circuit;
    this.vertexCutButtonContainer = new Node( {
      children: [ circuitNode.vertexCutButton ]
    } );

    this.circuitNode = circuitNode;

    this.addLinkedElement( vertex, {
      tandem: tandem.createTandem( 'vertex' )
    } );

    // Use a query parameter to turn on node voltage readouts for debugging only.
    // display for debugging only
    const customLabelText = new Text( '', {
      fontSize: 22,
      fill: CCKCColors.textFillProperty,
      pickable: false
    } );
    const voltageReadout = new Text( '', {
      fontSize: 14,
      fill: CCKCColors.textFillProperty,
      pickable: false
    } );
    const children = [
      customLabelText
    ];

    if ( CCKCQueryParameters.vertexDisplay ) {
      children.push( voltageReadout );
    }

    this.vertexLabelNode = new VBox( {
      children: children,
      maxWidth: 50
    } );

    // for debugging
    this.updateReadoutTextPosition = () => {
      this.vertexLabelNode.centerX = 0;
      this.vertexLabelNode.bottom = -30;
    };

    if ( CCKCQueryParameters.vertexDisplay ) {
      vertex.voltageProperty.link( voltage => {

        // No need for i18n because this is for debugging only
        const voltageText = `${Utils.toFixed( voltage, 3 )}V`;
        voltageReadout.setString( `${vertex.index} @ ${voltageText}` );
        assert && assert( this.updateReadoutTextPosition );
        if ( this.updateReadoutTextPosition ) {
          this.updateReadoutTextPosition();
        }
      } );
    }

    vertex.labelStringProperty.link( labelText => {
      customLabelText.string = labelText;
      this.updateReadoutTextPosition();
    } );

    this.vertex = vertex;
    this.startOffset = null;

    // Highlight is shown when the vertex is selected.
    this.highlightNode = new Circle( 30, {
      stroke: CCKCColors.highlightStrokeProperty,
      lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false
    } );

    // Shows up as red when disconnected or black when connected.  When unattachable, the dotted line disappears (black
    // box study)
    this.updateStrokeListener = this.updateStroke.bind( this );

    // Update when any vertex is added or removed, or when the existing circuit values change.
    circuit.vertexGroup.elementCreatedEmitter.addListener( this.updateStrokeListener );
    circuit.vertexGroup.elementDisposedEmitter.addListener( this.updateStrokeListener );
    circuit.circuitChangedEmitter.addListener( this.updateStrokeListener );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( this.updateStrokeListener );
    circuit.circuitElements.addItemRemovedListener( this.updateStrokeListener );

    vertex.attachableProperty.link( this.updateStrokeListener );

    this.updateSelectedListener = this.updateSelected.bind( this );
    vertex.selectionProperty.link( this.updateSelectedListener );
    vertex.isCuttableProperty.link( this.updateSelectedListener );

    this.updateMoveToFront = this.moveToFront.bind( this );
    vertex.relayerEmitter.addListener( this.updateMoveToFront );

    this.updatePickableListener = this.setPickable.bind( this );
    vertex.interactiveProperty.link( this.updatePickableListener );

    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    this.dragListener = new CircuitNodeDragListener( circuitNode, [ () => vertex ], {
      tandem: tandem.createTandem( 'dragListener' ),
      start: ( event: SceneryEvent ) => {
        initialPoint = event.pointer.point;
        latestPoint = event.pointer.point.copy();
        circuitNode.startDragVertex( event.pointer.point, vertex, vertex );
        dragged = false;
      },
      drag: ( event: SceneryEvent ) => {
        latestPoint = event.pointer.point.copy();
        dragged = true;
        circuitNode.dragVertex( event.pointer.point, vertex, true );
      },
      end: () => {

        // The vertex can only connect to something if it was actually moved.
        circuitNode.endDrag( vertex, dragged );

        // Only show on a tap, not on every drag.
        if ( vertex.interactiveProperty.get() && latestPoint!.distance( initialPoint! ) < CCKCConstants.TAP_THRESHOLD ) {
          vertex.selectionProperty.value = vertex;
        }
      }
    } );

    // When Vertex becomes undraggable, interrupt the input listener
    this.interruptionListener = this.setDraggable.bind( this );
    vertex.isDraggableProperty.lazyLink( this.interruptionListener );

    // Don't permit dragging by the scissors or highlight
    this.addInputListener( this.dragListener );

    // Make sure the cut button remains in the visible screen bounds.
    this.updateVertexNodePositionListener = this.updateVertexNodePosition.bind( this );
    vertex.positionProperty.link( this.updateVertexNodePositionListener );

    // When showing the highlight, make sure it shows in the right place (not updated while invisible)
    vertex.selectionProperty.link( this.updateVertexNodePositionListener );

    // If a vertex is created or disposed, check to see if the cut button enabled state should change
    circuit.vertexGroup.elementCreatedEmitter.addListener( this.updateSelectedListener );
    circuit.vertexGroup.elementDisposedEmitter.addListener( this.updateSelectedListener );
  }

  public override dispose(): void {
    const vertex = this.vertex;
    const circuit = this.circuit;
    const vertexCutButton = this.vertexCutButtonContainer;
    const circuitNode = this.circuitNode;
    vertex.positionProperty.unlink( this.updateVertexNodePositionListener );
    vertex.selectionProperty.unlink( this.updateVertexNodePositionListener );
    vertex.selectionProperty.unlink( this.updateSelectedListener );
    vertex.interactiveProperty.unlink( this.updatePickableListener );
    vertex.relayerEmitter.removeListener( this.updateMoveToFront );
    CCKCUtils.setInSceneGraph( false, circuitNode.buttonLayer, vertexCutButton );
    CCKCUtils.setInSceneGraph( false, circuitNode.highlightLayer, this.highlightNode );
    circuit.vertexGroup.elementCreatedEmitter.removeListener( this.updateStrokeListener );
    circuit.vertexGroup.elementDisposedEmitter.removeListener( this.updateStrokeListener );
    circuit.vertexGroup.elementCreatedEmitter.removeListener( this.updateSelectedListener );
    circuit.vertexGroup.elementDisposedEmitter.removeListener( this.updateSelectedListener );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.removeItemAddedListener( this.updateStrokeListener );
    circuit.circuitElements.removeItemRemovedListener( this.updateStrokeListener );

    vertex.attachableProperty.unlink( this.updateStrokeListener );
    circuit.circuitChangedEmitter.removeListener( this.updateStrokeListener );

    this.dragListener.dispose();
    this.removeInputListener( this.dragListener );

    vertex.isDraggableProperty.unlink( this.interruptionListener );

    this.vertexCutButtonContainer.dispose();

    super.dispose();
  }

  /**
   * Update whether the vertex is shown as selected.
   */
  private updateSelected(): void {
    //if this vertex is set to be disposed, do not update its selected logic
    if ( !this.isDisposed ) {
      const selected = this.vertex.isSelected();
      const neighborCircuitElements = this.circuit.getNeighborCircuitElements( this.vertex );

      if ( selected ) {

        // Adjacent components should be in front of the vertex, see #20
        for ( let i = 0; i < neighborCircuitElements.length; i++ ) {
          neighborCircuitElements[ i ].vertexSelectedEmitter.emit();
        }
        this.moveToFront();

        // in the state wrapper, the destination frame tries to apply this delete first, which steals it from the upstream frame
        const ignoreFocus = phet.preloads.phetio && phet.preloads.phetio.queryParameters.frameTitle === 'destination';
        if ( !ignoreFocus ) {
          this.focus();
        }
      }
      CCKCUtils.setInSceneGraph( selected, this.circuitNode.highlightLayer, this.highlightNode );
      const numberConnections = neighborCircuitElements.length;
      CCKCUtils.setInSceneGraph( selected && this.vertex.isCuttableProperty.value, this.circuitNode.buttonLayer, this.vertexCutButtonContainer );
      selected && this.updateVertexCutButtonPosition();

      // Show a disabled button as a cue that the vertex could be cuttable, but it isn't right now.
      const isConnectedBlackBoxVertex = numberConnections === 1 && !this.vertex.isDraggableProperty.get();

      const enabled = numberConnections > 1 || isConnectedBlackBoxVertex;
      this.vertexCutButtonContainer.filters = enabled ? [] : [ Grayscale.FULL ];
      this.vertexCutButtonContainer.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
      this.vertexCutButtonContainer.inputEnabled = enabled;
    }
  }

  private updateStroke(): void {

    // A memory leak was being caused by children getting added after dispose was called.
    // This is because the itemRemoved listener in CircuitNode is added (and hence called) before this callback.
    // The CircuitNode listener calls dispose but this listener still gets called back because emitter gets
    // a defensive copy of listeners.
    if ( !this.isDisposed ) {

      const desiredChild = this.circuit.countCircuitElements( this.vertex ) > 1 ? BLACK_CIRCLE_NODE : RED_CIRCLE_NODE;
      if ( this.getChildAt( 0 ) !== desiredChild ) {
        this.children = this.vertexLabelNode ? [ desiredChild, this.vertexLabelNode ] : [ desiredChild ];
      }
      this.visible = this.vertex.attachableProperty.get();
    }
  }

  // update the position of the cut button
  private updateVertexCutButtonPosition(): void {
    const position = this.vertex.positionProperty.get();

    const neighbors = this.circuit.getNeighborCircuitElements( this.vertex );

    // Compute an unweighted sum of adjacent element directions, and point in the opposite direction so the button
    // will appear in the least populated area.
    const sumOfDirections = new Vector2( 0, 0 );
    for ( let i = 0; i < neighbors.length; i++ ) {
      const v = this.vertex.positionProperty.get().minus(
        neighbors[ i ].getOppositeVertex( this.vertex ).positionProperty.get()
      );
      if ( v.magnitude > 0 ) {
        sumOfDirections.add( v.normalized() );
      }
    }
    if ( sumOfDirections.magnitude < 1E-6 ) {
      sumOfDirections.setXY( 0, -1 ); // Show the scissors above
    }

    const proposedPosition = position.plus( sumOfDirections.normalized().timesScalar( DISTANCE_TO_CUT_BUTTON ) );

    // Property doesn't exist until the node is attached to scene graph
    const bounds = this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty.get();

    const availableBounds = bounds.eroded( this.vertexCutButtonContainer.width / 2 );
    this.vertexCutButtonContainer.center = availableBounds.closestPointTo( proposedPosition );
  }

  /**
   * Move the VertexNode when the Vertex moves.
   */
  private updateVertexNodePosition(): void {
    const position = this.vertex.positionProperty.get();
    this.translation = position;

    // Update the position of the highlight, but only if it is visible
    if ( this.vertex.isSelected() ) {
      this.highlightNode.translation = position;
    }
    this.updateReadoutTextPosition && this.updateReadoutTextPosition();

    // Update the cut button position, but only if the cut button is showing (to save on CPU)
    this.vertex.isSelected() && this.updateVertexCutButtonPosition();
  }

  /**
   * Sets whether the node is draggable, used as a callback for interrupting the drag listener
   */
  private setDraggable( draggable: boolean ): void {
    if ( !draggable ) {
      this.dragListener.interrupt();
    }
  }
}

circuitConstructionKitCommon.register( 'VertexNode', VertexNode );