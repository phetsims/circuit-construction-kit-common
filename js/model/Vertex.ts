// Copyright 2016-2022, University of Colorado Boulder

/**
 * A Vertex indicates the end of one or more CircuitElements, or an open connection for the Black Box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import merge from '../../../phet-core/js/merge.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// Index counter for debugging
let counter = 0;

type VertexOptions = {
  draggable: boolean;
  attachable: boolean;
  interactive: boolean;
  blackBoxInterface: boolean;
  insideTrueBlackBox: boolean;
  tandem: Tandem;
} & PhetioObjectOptions;

export default class Vertex extends PhetioObject {

  // Index counter for hashing in CircuitLayerNode.  Also useful for debugging and can be shown with ?vertexDisplay=index
  readonly index: number;
  private readonly vertexTandem: Tandem;

  // position of the vertex
  readonly positionProperty: Property<Vector2>;

  // where the vertex would be if it hadn't snapped to a proposed connection
  readonly unsnappedPositionProperty: Property<Vector2>;

  // Relative voltage of the node, determined by Circuit.solve
  readonly voltageProperty: Property<number>;

  // after the user taps on a vertex it becomes selected, highlighting it and showing a 'cut' button. Multiple vertices
  // can be selected on an iPad, unlike CircuitElements, which can only have one vertex selected at a time.
  readonly isSelectedProperty: Property<boolean>;

  // Some of the following properties overlap.  For example, if 'insideTrueBlackBox' is true, then the interactive
  // flag will be set to false when the circuit is in Circuit.InteractionMode.TEST mode.

  // Vertices on the black box interface persist between build/investigate, and cannot be moved/deleted
  readonly isDraggableProperty: Property<boolean>;

  // Black box interface vertices can be interactive (tap to select) without being draggable
  readonly interactiveProperty: Property<boolean>;

  // whether the Vertex can be dragged or moved by dragging another part of the circuit must be observable.  When two
  // vertices are joined in Circuit.connect, non-interactivity propagates
  readonly attachableProperty: Property<boolean>;

  // whether the vertex is on the edge of a black box.  This means it cannot be deleted, but it can be attached to
  readonly blackBoxInterfaceProperty: Property<boolean>;

  // whether the vertex is inside the true black box, not inside the user-created black box, on the interface or outside of the black box
  readonly insideTrueBlackBoxProperty: Property<boolean>;

  // indicate when the vertex has been moved to the front in z-ordering and layering in the view must be updated
  readonly relayerEmitter: Emitter<[]>;

  // added by Circuit.js so that listeners can be removed when vertices are removed
  vertexSelectedPropertyListener: ( ( selected: boolean ) => void ) | null;

  // Whether the vertex is being actively dragged.
  isDragged: boolean;

  // for black box study
  outerWireStub: boolean;
  isCuttableProperty: BooleanProperty;
  labelTextProperty: StringProperty;

  static VertexIO: IOType;

  /**
   * @param {Vector2} position - position in view coordinates
   * @param {Object} [providedOptions]
   */
  constructor( position: Vector2, providedOptions?: Partial<VertexOptions> ) {

    const options = merge( {
      draggable: true, // whether the vertex can be dragged, false for Black Box elements
      attachable: true, // Black box interior elements cannot be connected while the box is closed
      interactive: true, // Black box interface vertices can be interactive (tap to select) without being draggable
      blackBoxInterface: false, // Black box interface vertices cannot be dragged or deleted, but can be connected to
      insideTrueBlackBox: false, // Behavior differs in explore vs test mode
      tandem: Tandem.OPTIONAL, // Temporary vertices (for icons) should not be instrumented since they
      phetioDynamicElement: true
      // are more of an implementation detail rather than a feature
    }, providedOptions ) as VertexOptions;

    super( options );

    this.index = counter++;

    this.vertexTandem = options.tandem;

    this.positionProperty = new Vector2Property( position, {
      tandem: options.tandem && options.tandem.createTandem( 'positionProperty' ),
      useDeepEquality: true,
      isValidValue: ( position: Vector2 ) => position.isFinite()
    } );

    this.unsnappedPositionProperty = new Vector2Property( position, {
      isValidValue: ( position: Vector2 ) => position.isFinite()
    } );

    this.voltageProperty = new NumberProperty( 0, {
      tandem: options.tandem && options.tandem.createTandem( 'voltageProperty' ),
      units: 'V',
      phetioReadOnly: true,
      phetioHighFrequency: true
    } );

    this.isSelectedProperty = new BooleanProperty( false, {
      tandem: options.tandem && options.tandem.createTandem( 'isSelectedProperty' )
    } );

    this.isDraggableProperty = new BooleanProperty( options.draggable, {
      tandem: options.tandem && options.tandem.createTandem( 'isDraggableProperty' )
    } );

    this.interactiveProperty = new BooleanProperty( options.interactive );
    this.attachableProperty = new BooleanProperty( options.attachable );
    this.blackBoxInterfaceProperty = new BooleanProperty( options.blackBoxInterface );
    this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );
    this.relayerEmitter = new Emitter();
    this.vertexSelectedPropertyListener = null;
    this.isDragged = false;
    this.outerWireStub = false;

    this.isCuttableProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'isCuttableProperty' )
    } );

    this.labelTextProperty = new StringProperty( '', {
      tandem: options.tandem.createTandem( 'labelTextProperty' )
    } );
  }

  /**
   * Called when vertices are cut.
   */
  setPosition( position: Vector2 ): void {
    this.positionProperty.set( position );
    this.unsnappedPositionProperty.set( position );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  dispose(): void {
    this.positionProperty.dispose();
    this.voltageProperty.dispose();
    this.isSelectedProperty.dispose();
    this.isDraggableProperty.dispose();
    this.isCuttableProperty.dispose();
    this.labelTextProperty.dispose();
    super.dispose();
  }
}

// @public {IOType}
Vertex.VertexIO = new IOType( 'VertexIO', {
  valueType: Vertex,
  toStateObject: ( vertex: Vertex ) => ( { position: Vector2.Vector2IO.toStateObject( vertex.positionProperty.value ) } ),
  stateToArgsForConstructor: ( stateObject: any ) => [ Vector2.Vector2IO.fromStateObject( stateObject.position ) ],
  stateSchema: {
    position: Vector2.Vector2IO
  }
} );

circuitConstructionKitCommon.register( 'Vertex', Vertex );