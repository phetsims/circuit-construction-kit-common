// Copyright 2015-2023, University of Colorado Boulder

/**
 * The node for a wire, which can be stretched out by dragging its vertices.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { LineStyles, Shape } from '../../../kite/js/imports.js';
import { Circle, Color, Line, LinearGradient, Node, Path, SceneryEvent } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Vertex from '../model/Vertex.js';
import Wire from '../model/Wire.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitElementNode from './CircuitElementNode.js';
import CircuitNode from './CircuitNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';
import CCKCColors from './CCKCColors.js';

// constants
const LIFELIKE_LINE_WIDTH = 16; // line width in screen coordinates
const SCHEMATIC_LINE_WIDTH = CCKCConstants.SCHEMATIC_LINE_WIDTH; // line width in screen coordinates

// constants
const MATRIX = new Matrix3(); // The Matrix entries are mutable
const WIRE_RASTER_LENGTH = 100;

// Node used to render the black line for schematic, rasterized so it can render with WebGL
const BLACK_LINE_NODE = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: SCHEMATIC_LINE_WIDTH,
  stroke: Color.BLACK
} ).rasterized( { wrap: false } );

// Not displayed, used to get accurate hit bounds for the schematic view.
const SCHEMATIC_BACKGROUND = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: LIFELIKE_LINE_WIDTH,
  stroke: Color.BLUE,
  opacity: 0.0
} ).rasterized( { wrap: false } );

/**
 * Create a LinearGradient for the wire, depending on the orientation relative to the shading (light comes from
 * top left)
 * @param colorStops - entries have point: Number, color: Color
 * @param colorStopPointMap - (Vector2) => number, the operation to apply to create color stops
 */
const createGradient = ( colorStops: Array<{ point: number; color: Color }>, colorStopPointMap: ( n: number ) => number ) => {
  const gradient = new LinearGradient( 0, -LIFELIKE_LINE_WIDTH / 2, 0, LIFELIKE_LINE_WIDTH / 2 );
  colorStops.forEach( colorStop => {
    gradient.addColorStop( colorStopPointMap( colorStop.point ), colorStop.color );
  } );
  return gradient;
};

const colorStops = [
  { point: 0.0, color: new Color( '#993f35' ) },
  { point: 0.2, color: new Color( '#cd7767' ) },
  { point: 0.3, color: new Color( '#f6bda0' ) },
  { point: 1.0, color: new Color( '#3c0c08' ) }
];

const normalGradient = createGradient( colorStops, _.identity );
const reverseGradient = createGradient( colorStops.reverse(), ( e: number ) => 1.0 - e );

const lifelikeNodeNormal = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: LIFELIKE_LINE_WIDTH,
  stroke: normalGradient
} ).rasterized( { wrap: false } );

const lifelikeNodeReversed = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
  lineWidth: LIFELIKE_LINE_WIDTH,
  stroke: reverseGradient
} ).rasterized( { wrap: false } );

// Make sure the heights are the same as the wires so they will line up properly, see
// https://github.com/phetsims/circuit-construction-kit-common/issues/390
const lifelikeRoundedCapNormal = new Circle( LIFELIKE_LINE_WIDTH / 2, {
  fill: normalGradient
} ).rasterized( { wrap: false } );

const lifelikeRoundedCapReversed = new Circle( LIFELIKE_LINE_WIDTH / 2, {
  fill: reverseGradient
} ).rasterized( { wrap: false } );

const HIGHLIGHT_STROKE_LINE_STYLES = new LineStyles( {
  lineWidth: 26,
  lineCap: 'round',
  lineJoin: 'round'
} );

const TOUCH_AREA_LINE_STYLES = new LineStyles( {
  lineWidth: 23
} );

/**
 * Convenience function that gets the stroked shape for the wire line node with the given style
 */
const getHighlightStrokedShape = ( wire: Wire ) => {
  const startPoint = wire.startPositionProperty.get();
  const endPoint = wire.endPositionProperty.get();
  return Shape.lineSegment( startPoint.x, startPoint.y, endPoint.x, endPoint.y )
    .getStrokedShape( HIGHLIGHT_STROKE_LINE_STYLES );
};

/**
 * Convenience function that gets the stroked shape for the wire line node with the given style
 */
const getTouchArea = ( wire: Wire ) => {
  const startPoint = wire.startPositionProperty.get();
  const endPoint = wire.endPositionProperty.get();
  const distance = endPoint.distance( startPoint );
  const vertexInset = 0; // run to the edge of the wire as we do for FixedCircuitElements
  let touchAreaStart = null;
  let touchAreaEnd = null;

  // Extend the touch area from vertex to vertex
  if ( distance > vertexInset * 2 ) {
    touchAreaStart = startPoint.blend( endPoint, vertexInset / distance );
    touchAreaEnd = endPoint.blend( startPoint, vertexInset / distance );
  }
  else {

    // Not enough room for any touch area for this wire
    touchAreaStart = startPoint.average( endPoint );
    touchAreaEnd = touchAreaStart;
  }

  return Shape.lineSegment( touchAreaStart, touchAreaEnd ).getStrokedShape( TOUCH_AREA_LINE_STYLES );
};

export default class WireNode extends CircuitElementNode {
  private readonly viewTypeProperty: Property<CircuitElementViewType>;
  private readonly circuitNode: CircuitNode | null;
  private readonly wire: Wire;
  private readonly startCapParent: Node;
  private readonly endCapParent: Node;
  private readonly lineNodeParent: Node;
  private readonly lineNode: Node;
  private readonly highlightNode: Path;
  public readonly dragListener: CircuitNodeDragListener | null;
  private readonly disposeWireNode: () => void;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static readonly webglSpriteNodes = [
    BLACK_LINE_NODE,
    lifelikeNodeNormal,
    lifelikeNodeReversed,
    lifelikeRoundedCapNormal
  ];

  /**
   * @param screenView - the icon is created separately in CircuitElementToolFactory, so (unlike
   *                                    - other CircuitElement types) the screenView is required
   * @param circuitNode
   * @param wire
   * @param viewTypeProperty
   * @param tandem
   */
  public constructor( screenView: CCKCScreenView, circuitNode: CircuitNode | null, wire: Wire, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem ) {

    const startCapParent = new Node( {
      children: [ lifelikeRoundedCapNormal ]
    } );

    const endCapParent = new Node( {
      children: [ lifelikeRoundedCapNormal ]
    } );

    // The node that shows the yellow highlight for the node when selected
    const highlightNode = new Path( null, {
      stroke: CCKCColors.highlightStrokeProperty,
      lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false,
      visible: false
    } );

    // The node that displays the main line (for both schematic and lifelike).  This does not include
    // the rounded caps for the lifelike view
    const lineNode = new Node();

    const lineNodeParent = new Node( {
      children: [ lineNode ],
      cursor: 'pointer'
    } );
    const highlightNodeParent = new Node( {
      children: [ highlightNode ]
    } );

    circuitNode && circuitNode.highlightLayer.addChild( highlightNodeParent );

    const circuit = circuitNode && circuitNode.circuit;
    super( wire, circuit, {
      children: [
        startCapParent,
        endCapParent,
        lineNodeParent
      ],
      tandem: tandem
    } );

    this.viewTypeProperty = viewTypeProperty;

    this.circuitNode = circuitNode;

    this.wire = wire;

    this.startCapParent = startCapParent;
    this.endCapParent = endCapParent;
    this.lineNodeParent = lineNodeParent;
    this.lineNode = lineNode;
    this.highlightNode = highlightNode;

    /**
     * When the view type changes (lifelike vs schematic), update the node
     */
    const markAsDirty = () => {
      if ( this.isDisposed ) {
        return;
      }
      this.markAsDirty();

      // For the icon, we must update right away since no step() is called
      if ( !circuitNode ) {
        this.updateRender();
      }
    };

    viewTypeProperty.link( markAsDirty );

    /**
     * Update whether the WireNode is pickable
     */
    const updatePickable = ( interactive: boolean ) => {
      this.pickable = interactive;
    };
    wire.interactiveProperty.link( updatePickable );

    // When the start vertex changes to a different instance (say when vertices are soldered together), unlink the
    // old one and link to the new one.
    const doUpdateTransform = ( newVertex: Vertex, oldVertex: Vertex | null | undefined ) => {
      oldVertex && oldVertex.positionProperty.unlink( markAsDirty );
      newVertex.positionProperty.link( markAsDirty );
    };
    wire.startVertexProperty.link( doUpdateTransform );
    wire.endVertexProperty.link( doUpdateTransform );

    // Keep track of the start point to see if it was dragged or tapped to be selected
    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;

    // Keep track of whether it was dragged
    let dragged = false;

    if ( screenView ) {

      assert && assert( circuitNode !== null );

      // Input listener for dragging the body of the wire, to translate it.
      this.dragListener = new CircuitNodeDragListener( circuitNode!, [
        () => wire.startVertexProperty.get(),
        () => wire.endVertexProperty.get()
      ], {
        tandem: tandem.createTandem( 'dragListener' ),
        start: ( event: SceneryEvent ) => {
          if ( wire.interactiveProperty.get() ) {

            // Start drag by starting a drag on start and end vertices
            circuitNode!.startDragVertex( event.pointer.point, wire.startVertexProperty.get(), this.circuitElement );
            circuitNode!.startDragVertex( event.pointer.point, wire.endVertexProperty.get(), this.circuitElement );
            dragged = false;
            initialPoint = event.pointer.point.copy();
            latestPoint = event.pointer.point.copy();
          }
        },
        drag: ( event: SceneryEvent ) => {
          if ( wire.interactiveProperty.get() ) {

            latestPoint = event.pointer.point.copy();

            // Drag by translating both of the vertices
            circuitNode!.dragVertex( event.pointer.point, wire.startVertexProperty.get(), false );
            circuitNode!.dragVertex( event.pointer.point, wire.endVertexProperty.get(), false );
            dragged = true;
          }
        },
        end: () => {
          this.endDrag( this, [
            wire.startVertexProperty.get(),
            wire.endVertexProperty.get()
          ], screenView, circuitNode!, initialPoint!, latestPoint!, dragged );
        }
      } );
      this.addInputListener( this.dragListener );

      circuitNode!.circuit.selectionProperty.link( markAsDirty );
    }
    else {
      this.dragListener = null;
    }

    /**
     * Move the wire element to the back of the view when connected to another circuit element
     */
    const moveToBack = () => {

      // Components outside the black box do not move in back of the overlay
      if ( wire.interactiveProperty.get() ) {

        // Connected wires should always be behind the solder and circuit elements
        this.moveToBack();
      }
    };
    wire.connectedEmitter.addListener( moveToBack );

    this.disposeWireNode = () => {
      assert && assert( this.dragListener );
      this.dragListener!.interrupt();
      this.dragListener!.dispose();

      wire.startVertexProperty.unlink( doUpdateTransform );
      wire.endVertexProperty.unlink( doUpdateTransform );

      circuitNode && circuitNode.circuit.selectionProperty.unlink( markAsDirty );
      wire.interactiveProperty.unlink( updatePickable );

      wire.startPositionProperty.unlink( markAsDirty );
      wire.endPositionProperty.unlink( markAsDirty );

      wire.connectedEmitter.removeListener( moveToBack );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightNodeParent );

      viewTypeProperty.unlink( markAsDirty );

      this.lineNode.dispose();
      this.highlightNode.dispose();
      this.lineNodeParent.dispose();
      highlightNodeParent.dispose();
      this.startCapParent.dispose();
      this.endCapParent.dispose();
    };

    // For icons, update the end caps
    !circuitNode && this.updateRender();
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * CCKCLightBulbNode calls updateRender for its child socket node
   */
  public updateRender(): void {
    const view = this.viewTypeProperty.value;
    if ( view === CircuitElementViewType.LIFELIKE ) {

      // determine whether to use the forward or reverse gradient based on the angle
      const startPoint = this.wire.startPositionProperty.get();
      const endPoint = this.wire.endPositionProperty.get();
      const lightingDirection = new Vector2( 0.916, 0.4 ); // sampled manually
      const wireVector = endPoint.minus( startPoint );
      const dot = lightingDirection.dot( wireVector );

      // only change children if necessary
      const lineNodeChild = dot < 0 ? lifelikeNodeReversed : lifelikeNodeNormal;
      const capChild = dot < 0 ? lifelikeRoundedCapReversed : lifelikeRoundedCapNormal;
      this.lineNode.getChildAt( 0 ) !== lineNodeChild && this.lineNode.setChildren( [ lineNodeChild ] );
      this.endCapParent.getChildAt( 0 ) !== capChild && this.endCapParent.setChildren( [ capChild ] );
      this.startCapParent.getChildAt( 0 ) !== capChild && this.startCapParent.setChildren( [ capChild ] );
      this.startCapParent.visible = true;
      this.endCapParent.visible = true;
    }
    else {
      ( this.lineNode.getChildAt( 0 ) !== SCHEMATIC_BACKGROUND ) && this.lineNode.setChildren( [ SCHEMATIC_BACKGROUND, BLACK_LINE_NODE ] );
      this.startCapParent.visible = false;
      this.endCapParent.visible = false;
    }

    const startPosition = this.circuitElement.startPositionProperty.get();
    const endPosition = this.circuitElement.endPositionProperty.get();
    const delta = endPosition.minus( startPosition );

    // Prevent the case where a vertex lies on another vertex, particularly for fuzz testing
    const magnitude = Math.max( delta.magnitude, 1E-8 );
    const angle = delta.angle;

    // Update the node transform
    this.endCapParent.setMatrix( MATRIX.setToTranslationRotationPoint( endPosition, angle ) );

    // This transform is done second so the matrix is already in good shape for the scaling step
    this.startCapParent.setMatrix( MATRIX.setToTranslationRotationPoint( startPosition, angle ) );

    MATRIX.multiplyMatrix( Matrix3.scaling( magnitude / WIRE_RASTER_LENGTH, 1 ) );
    this.lineNodeParent.setMatrix( MATRIX );

    if ( this.circuitNode ) {
      const selectedCircuitElement = this.circuitNode.circuit.selectionProperty.get();
      const isCurrentlyHighlighted = selectedCircuitElement === this.wire;
      this.highlightNode.visible = isCurrentlyHighlighted;
      if ( isCurrentlyHighlighted ) {
        this.highlightNode.shape = getHighlightStrokedShape( this.wire );
      }
    }
    this.touchArea = getTouchArea( this.wire );
    this.mouseArea = this.touchArea;
  }

  public override dispose(): void {
    this.disposeWireNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'WireNode', WireNode );