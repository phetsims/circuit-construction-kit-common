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
  draggable: boolean,
  attachable: boolean,
  interactive: boolean,
  blackBoxInterface: boolean,
  insideTrueBlackBox: boolean,
  tandem: Tandem
} & PhetioObjectOptions;

class Vertex extends PhetioObject {
  readonly index: number;
  private readonly vertexTandem: Tandem;
  readonly positionProperty: Property<Vector2>;
  readonly unsnappedPositionProperty: Property<Vector2>;
  readonly voltageProperty: Property<number>;
  readonly selectedProperty: Property<boolean>;
  readonly draggableProperty: Property<boolean>;
  readonly interactiveProperty: Property<boolean>;
  readonly attachableProperty: Property<boolean>;
  readonly blackBoxInterfaceProperty: Property<boolean>;
  readonly insideTrueBlackBoxProperty: Property<boolean>;
  readonly relayerEmitter: Emitter<[]>;
  private readonly vertexSelectedPropertyListener: null;
  isDragged: boolean;
  static VertexIO: IOType;
  outerWireStub: boolean;
  isCuttableProperty: BooleanProperty;

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

    // @public (readonly) {number} - Index counter for hashing in CircuitLayerNode.  Also useful for debugging and can be shown
    // with ?vertexDisplay=index
    this.index = counter++;

    // @public (read-only) {Tandem}
    this.vertexTandem = options.tandem;

    // @public - position of the vertex
    this.positionProperty = new Vector2Property( position, {
      tandem: options.tandem && options.tandem.createTandem( 'positionProperty' ),
      useDeepEquality: true,
      isValidValue: ( position: Vector2 ) => position.isFinite()
    } );

    // @public - where the vertex would be if it hadn't snapped to a proposed connection
    this.unsnappedPositionProperty = new Vector2Property( position, {
      isValidValue: ( position: Vector2 ) => position.isFinite()
    } );

    // @public {NumberProperty} Relative voltage of the node, determined by Circuit.solve
    this.voltageProperty = new NumberProperty( 0, {
      tandem: options.tandem && options.tandem.createTandem( 'voltageProperty' ),
      units: 'V',
      phetioReadOnly: true
    } );

    // @public {BooleanProperty} - after the user taps on a vertex it becomes selected, highlighting it and showing a
    // 'cut' button. Multiple vertices can be selected on an iPad, unlike CircuitElements, which can only have one
    // vertex selected at a time.
    this.selectedProperty = new BooleanProperty( false, {
      tandem: options.tandem && options.tandem.createTandem( 'selectedProperty' )
    } );

    // Some of the following properties overlap.  For example, if 'insideTrueBlackBox' is true, then the interactive
    // flag will be set to false when the circuit is in Circuit.InteractionMode.TEST mode.

    // @public {BooleanProperty} - Vertices on the black box interface persist between build/investigate, and cannot be
    // moved/deleted
    this.draggableProperty = new BooleanProperty( options.draggable, {
      tandem: options.tandem && options.tandem.createTandem( 'draggableProperty' )
    } );

    // @public {BooleanProperty} - Black box interface vertices can be interactive (tap to select) without being
    // draggable
    this.interactiveProperty = new BooleanProperty( options.interactive );

    // @public {BooleanProperty} - whether the Vertex can be dragged or moved by dragging another part of the circuit
    // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
    this.attachableProperty = new BooleanProperty( options.attachable );

    // @public (read-only) {BooleanProperty} - whether the vertex is on the edge of a black box.  This means it cannot
    // be deleted, but it can be attached to
    this.blackBoxInterfaceProperty = new BooleanProperty( options.blackBoxInterface );

    // @public {BooleanProperty} - whether the vertex is inside the true black box, not inside the
    // user-created black box, on the interface or outside of the black box
    this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );

    // @public {Emitter} - indicate when the vertex has been moved to the front in z-ordering and layering in the
    // view must be updated
    this.relayerEmitter = new Emitter();

    // @public {function|null} - added by Circuit.js so that listeners can be removed when vertices are removed
    this.vertexSelectedPropertyListener = null;

    // @public {boolean} - Whether the vertex is being actively dragged.
    this.isDragged = false;

    // @public {boolean} - for black box study
    this.outerWireStub = false;

    this.isCuttableProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'isCuttableProperty' )
    } );
  }

  /**
   * Called when vertices are cut.
   * @param {Vector2} position
   * @public
   */
  setPosition( position: Vector2 ) {
    this.positionProperty.set( position );
    this.unsnappedPositionProperty.set( position );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.positionProperty.dispose();
    this.voltageProperty.dispose();
    this.selectedProperty.dispose();
    this.draggableProperty.dispose();
    this.isCuttableProperty.dispose();
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
export default Vertex;
