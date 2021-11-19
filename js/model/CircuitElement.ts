// Copyright 2016-2021, University of Colorado Boulder

/**
 * CircuitElement is the base class for all elements that can be part of a circuit, including:
 * Wire, Resistor, Battery, LightBulb, Switch.  It has a start vertex and end vertex and a model for its own current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

import Circuit from './Circuit.js';
import CurrentSense from './CurrentSense.js';
import Vertex from './Vertex.js';

// variables
let index = 0;

type CircuitElementOptions = {
  isFlammable: boolean,
  isMetallic: boolean,
  isSizeChangedOnViewChange: boolean,
  canBeDroppedInToolbox: boolean,
  isCurrentReentrant: boolean,
  interactive: boolean,
  insideTrueBlackBox: boolean
};

abstract class CircuitElement extends PhetioObject {
  readonly id: number;
  private readonly creationTime: number;
  readonly isFlammable: boolean;
  readonly isMetallic: boolean;
  readonly isSizeChangedOnViewChange: boolean;
  readonly canBeDroppedInToolbox: boolean;
  readonly startVertexProperty: Property<Vertex>;
  readonly endVertexProperty: Property<Vertex>;
  readonly currentProperty: Property<number>;
  readonly currentSenseProperty: Property<CurrentSense>;
  readonly interactiveProperty: BooleanProperty;
  readonly insideTrueBlackBoxProperty: BooleanProperty;
  chargeLayoutDirty: boolean;
  readonly connectedEmitter: Emitter<[]>;
  readonly vertexSelectedEmitter: Emitter<[]>;
  readonly vertexMovedEmitter: Emitter<[]>;
  readonly moveToFrontEmitter: Emitter<[]>;
  readonly startDragEmitter: Emitter<[ SceneryEvent ]>;
  readonly disposeEmitterCircuitElement: Emitter<[]>;
  private readonly vertexMovedListener: () => void;
  private readonly linkVertexListener: ( newVertex: Vertex, oldVertex: Vertex | null | undefined, property: Property<Vertex> ) => void;
  readonly voltageDifferenceProperty: NumberProperty;
  private readonly vertexVoltageListener: () => void;
  chargePathLength: number;
  circuitElementDisposed: boolean;
  static CircuitElementIO: IOType;
  readonly lengthProperty: Property<number> | undefined;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} chargePathLength
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, chargePathLength: number, tandem: Tandem, providedOptions?: Partial<CircuitElementOptions> ) {
    assert && assert( startVertex !== endVertex, 'startVertex cannot be the same as endVertex' );
    assert && assert( typeof chargePathLength === 'number', 'charge path length should be a number' );
    assert && assert( chargePathLength > 0, 'charge path length must be positive' );

    const options = merge( {
      canBeDroppedInToolbox: true, // In the CCK: Basics intro screen, CircuitElements can't be dropped into the toolbox
      interactive: true, // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
      isSizeChangedOnViewChange: true,
      insideTrueBlackBox: false,
      isMetallic: false, // Metallic items can have their voltage read directly (unshielded)
      isFlammable: false,
      tandem: tandem,
      isCurrentReentrant: false,
      phetioDynamicElement: true,
      phetioType: CircuitElement.CircuitElementIO
    }, providedOptions ) as CircuitElementOptions;

    super( options );

    // @public (read-only) {number} unique identifier for looking up corresponding views
    this.id = index++;

    // @public (read-only) {number} track the time of creation so it can't be dropped in the toolbox for 0.5 seconds
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/244
    this.creationTime = phet.joist.elapsedTime;

    // @public (read-only) {boolean} flammable circuit elements can catch on fire
    this.isFlammable = options.isFlammable;

    // @public (read-only) {boolean} metallic circuit elements behave like exposed wires--sensor values can be read
    // directly on the resistor. For instance, coins and paper clips and wires are metallic and can have their values
    // read directly.
    this.isMetallic = options.isMetallic;

    // @public (read-only) {boolean} - whether the size changes when changing from lifelike/schematic, used to determine
    // whether the highlight region should be changed.  True for everything except the switch.
    this.isSizeChangedOnViewChange = options.isSizeChangedOnViewChange;

    // @public (read-only) {number} - whether it is possible to drop the CircuitElement in the toolbox
    this.canBeDroppedInToolbox = options.canBeDroppedInToolbox;

    // @public {Property.<Vertex>} - the Vertex at the origin of the CircuitElement, may change when CircuitElements are
    // connected
    this.startVertexProperty = new Property( startVertex );

    // @public {Property.<Vertex>} - the Vertex at the end of the CircuitElement, may change when CircuitElements are
    // connected
    this.endVertexProperty = new Property( endVertex );

    // @public {NumberProperty} - the flowing current, in amps.
    this.currentProperty = new NumberProperty( 0, {
      reentrant: options.isCurrentReentrant
    } );
    this.currentProperty.link( current => {
      assert && assert( !isNaN( current ) );
    } );

    // we assign the directionality based on the initial current direction, so the initial current is always positive.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/508
    this.currentSenseProperty = new Property<CurrentSense>( 'unspecified' );

    // @public (read-only) {BooleanProperty} - true if the CircuitElement can be edited and dragged
    this.interactiveProperty = new BooleanProperty( options.interactive );

    // @public {BooleanProperty} - whether the circuit element is inside the true black box, not inside the user-created
    // black box, on the interface or outside of the black box
    this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );

    // @public {boolean} - true if the charge layout must be updated (each element is visited every frame to check this)
    this.chargeLayoutDirty = true;

    // @public (read-only) {Emitter} - indicate when this CircuitElement has been connected to another CircuitElement
    this.connectedEmitter = new Emitter();

    // @public (read-only) {Emitter} - indicate when the CircuitElement has been moved to the front in z-ordering
    this.moveToFrontEmitter = new Emitter();

    // @public (read-only) {Emitter} - indicate when an adjacent Vertex has moved to front, so that the corresponding
    // Node can move to front too
    this.vertexSelectedEmitter = new Emitter();

    // @public (read-only) {Emitter} - indicate when either Vertex has moved
    this.vertexMovedEmitter = new Emitter();

    // @public (read-only) {Emitter} - indicate when the circuit element has started being dragged, when it is created
    // in the toolbox
    this.startDragEmitter = new Emitter( { parameters: [ { valueType: SceneryEvent } ] } );

    // @public (read-only) {Emitter} - indicate when the circuit element has been disposed
    this.disposeEmitterCircuitElement = new Emitter();

    // @private {function} - Signify that a Vertex moved
    this.vertexMovedListener = this.emitVertexMoved.bind( this );

    // @private {function} - stored for disposal
    this.linkVertexListener = this.linkVertex.bind( this );

    this.startPositionProperty.link( this.vertexMovedListener );
    this.endPositionProperty.link( this.vertexMovedListener );

    // @public - named so it doesn't collide with the specified voltageProperty in Battery or ACVoltage
    this.voltageDifferenceProperty = new NumberProperty( this.computeVoltageDifference() );

    // @private
    this.vertexVoltageListener = () => this.voltageDifferenceProperty.set( this.computeVoltageDifference() );

    // @ts-ignore
    this.startVertexProperty.link( this.linkVertexListener );
    // @ts-ignore
    this.endVertexProperty.link( this.linkVertexListener );

    // @public (read-only by clients, writable-by-subclasses) {number} the distance the charges must take to get to the
    // other side of the component. This is typically the distance between vertices, but not for light bulbs.  This
    // value is constant, except for (a) wires which can have their length changed and (b) LightBulbs whose path
    // length changes when switching between LIFELIKE |SCHEMATIC
    this.chargePathLength = chargePathLength;

    // @public {boolean}
    // The ammeter update is called after items are disposed but before corresponding views are disposed, so we must
    // take care not to display current for any items that are pending deletion.
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/418
    this.circuitElementDisposed = false;
    this.lengthProperty = undefined;
  }

  /**
   * Determine the voltage difference between end vertex and start vertex
   * @returns {number}
   * @private
   */
  computeVoltageDifference() {
    return this.endVertexProperty.value.voltageProperty.value -
           this.startVertexProperty.value.voltageProperty.value;
  }

  /**
   * When the start or end Vertex changes, move the listeners from the old Vertex to the new one
   * @param newVertex - the new vertex
   * @param oldVertex - the previous vertex
   * @param property
   * @private
   */
  linkVertex( newVertex: Vertex, oldVertex: Vertex | null | undefined, property: Property<Vertex> ) {

    // These guards prevent errors from the bad transient state caused by the Circuit.flip causing the same Vertex
    // to be both start and end at the same time.
    if ( oldVertex ) {
      oldVertex.positionProperty.hasListener( this.vertexMovedListener ) && oldVertex.positionProperty.unlink( this.vertexMovedListener );
      oldVertex.voltageProperty.hasListener( this.vertexVoltageListener ) && oldVertex.voltageProperty.unlink( this.vertexVoltageListener );

      if ( !oldVertex.positionProperty.get().equals( newVertex.positionProperty.get() ) ) {
        this.vertexMovedEmitter.emit();
      }
    }

    if ( !newVertex.positionProperty.hasListener( this.vertexMovedListener ) ) {
      newVertex.positionProperty.lazyLink( this.vertexMovedListener );
    }
    if ( !newVertex.voltageProperty.hasListener( this.vertexVoltageListener ) ) {
      newVertex.voltageProperty.link( this.vertexVoltageListener );
    }

    this.voltageDifferenceProperty.set( this.computeVoltageDifference() );
  }

  /**
   * Update the value of currentSenseProperty, see its documentation for details.
   * @param {number} time
   * @param {Circuit} circuit
   * @public
   */
  determineSense( time: number, circuit: Circuit ) {

    const current = this.currentProperty.value;

    // Disconnected circuits have a current of exactly 0, so we can use that to determine when to clear the sense
    const isReadyToClear = current === 0;

    if ( isReadyToClear ) {

      // Reset directionality, and take new directionality when current flows again
      this.currentSenseProperty.value = 'unspecified';
    }
    else if ( this.currentSenseProperty.value === 'unspecified' ) {

      // If there are other circuit elements, match with them.
      const otherCircuitElements = circuit.circuitElements.filter( c => c !== this && c.currentSenseProperty.value !== 'unspecified' );
      if ( otherCircuitElements.length === 0 ) {

        // If this is the first circuit element, choose the current sense so the initial readout is positive
        this.currentSenseProperty.value = getSenseForPositive( current );
      }
      else {

        const rootElement = otherCircuitElements[ 0 ];

        const desiredSign = rootElement.currentProperty.value >= 0 && rootElement.currentSenseProperty.value === 'forward' ? 'positive' :
                            rootElement.currentProperty.value >= 0 && rootElement.currentSenseProperty.value === 'backward' ? 'negative' :
                            rootElement.currentProperty.value < 0 && rootElement.currentSenseProperty.value === 'forward' ? 'negative' :
                            rootElement.currentProperty.value < 0 && rootElement.currentSenseProperty.value === 'backward' ? 'positive' :
                            'error';

        assert && assert( desiredSign !== 'error' );
        this.currentSenseProperty.value = desiredSign === 'positive' ?
                                          getSenseForPositive( current ) :
                                          getSenseForNegative( current );
      }
    }
  }

  /**
   * Steps forward in time
   * @public
   *
   * @param {number} time
   * @param {number} dt
   * @param {Circuit} circuit
   */
  step( time: number, dt: number, circuit: Circuit ) {
  }

  /**
   * Convenience method to get the start vertex position Property
   * @returns {Property.<Vector2>}
   * @public
   */
  get startPositionProperty() {
    return this.startVertexProperty.get().positionProperty;
  }

  /**
   * Convenience method to get the end vertex position Property
   * @returns {Property.<Vector2>}
   * @public
   */
  get endPositionProperty() {
    return this.endVertexProperty.get().positionProperty;
  }

  /**
   * Signify that a vertex has moved.
   * @private
   */
  emitVertexMoved() {

    // We are (hopefully!) in the middle of updating both vertices and we (hopefully!) will receive another callback
    // shortly with the correct values for both startPosition and endPosition
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/413
    // if ( assert && this.isFixedCircuitElement && this.startPositionProperty.value.equals( this.endPositionProperty.value ) ) {
    //   assert && stepTimer.setTimeout( function() {
    //     assert && assert( !this.startPositionProperty.value.equals( this.endPositionProperty.value ), 'vertices cannot be in the same spot' );
    //   }, 0 );
    // }
    this.vertexMovedEmitter.emit();
  }

  /**
   * Release resources associated with this CircuitElement, called when it will no longer be used.
   * @public
   */
  dispose() {
    assert && assert( !this.circuitElementDisposed, 'circuit element was already disposed' );
    this.circuitElementDisposed = true;

    // Notify about intent to dispose first because dispose listeners may need to access state
    this.disposeEmitterCircuitElement.emit();
    this.disposeEmitterCircuitElement.dispose();

    this.startVertexProperty.unlink( this.linkVertexListener );
    this.endVertexProperty.unlink( this.linkVertexListener );

    this.startPositionProperty.hasListener( this.vertexMovedListener ) && this.startPositionProperty.unlink( this.vertexMovedListener );
    this.endPositionProperty.hasListener( this.vertexMovedListener ) && this.endPositionProperty.unlink( this.vertexMovedListener );

    const startVoltageProperty = this.startVertexProperty.value.voltageProperty;
    const endVoltageProperty = this.endVertexProperty.value.voltageProperty;

    if ( startVoltageProperty.hasListener( this.vertexVoltageListener ) ) {
      startVoltageProperty.unlink( this.vertexVoltageListener );
    }

    if ( endVoltageProperty.hasListener( this.vertexVoltageListener ) ) {
      endVoltageProperty.unlink( this.vertexVoltageListener );
    }

    super.dispose();
  }

  /**
   * Replace one of the vertices with a new one, when CircuitElements are connected.
   * @param {Vertex} oldVertex - the vertex which will be replaced.
   * @param {Vertex} newVertex - the vertex which will take the place of oldVertex.
   * @public
   */
  replaceVertex( oldVertex: Vertex, newVertex: Vertex ) {
    const startVertex = this.startVertexProperty.get();
    const endVertex = this.endVertexProperty.get();

    assert && assert( oldVertex !== newVertex, 'Cannot replace with the same vertex' );
    assert && assert( oldVertex === startVertex || oldVertex === endVertex, 'Cannot replace a nonexistent vertex' );
    assert && assert( newVertex !== startVertex && newVertex !== endVertex, 'The new vertex shouldn\'t already be ' +
                                                                            'in the circuit element.' );

    if ( oldVertex === startVertex ) {
      this.startVertexProperty.set( newVertex );
    }
    else {
      this.endVertexProperty.set( newVertex );
    }
  }

  /**
   * Gets the Vertex on the opposite side of the specified Vertex
   * @param {Vertex} vertex
   * @public
   */
  getOppositeVertex( vertex: Vertex ) {
    assert && assert( this.containsVertex( vertex ), 'Missing vertex' );
    if ( this.startVertexProperty.get() === vertex ) {
      return this.endVertexProperty.get();
    }
    else {
      return this.startVertexProperty.get();
    }
  }

  /**
   * Returns whether this CircuitElement contains the specified Vertex as its startVertex or endVertex.
   * @param {Vertex} vertex - the vertex to check for
   * @returns {boolean}
   * @public
   */
  containsVertex( vertex: Vertex ) {
    return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
  }

  /**
   * Returns true if this CircuitElement contains both Vertex instances.
   * @param {Vertex} vertex1
   * @param {Vertex} vertex2
   * @returns {boolean}
   * @public
   */
  containsBothVertices( vertex1: Vertex, vertex2: Vertex ) {
    return this.containsVertex( vertex1 ) && this.containsVertex( vertex2 );
  }

  /**
   * Updates the given matrix with the position and angle at the specified position along the element.
   * @param {number} distanceAlongWire - the scalar distance from one endpoint to another.
   * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
   * @public
   */
  updateMatrixForPoint( distanceAlongWire: number, matrix: Matrix3 ) {
    const startPosition = this.startPositionProperty.get();
    const endPosition = this.endPositionProperty.get();
    const translation = startPosition.blend( endPosition, distanceAlongWire / this.chargePathLength );
    assert && assert( !isNaN( translation.x ), 'x should be a number' );
    assert && assert( !isNaN( translation.y ), 'y should be a number' );
    const angle = Vector2.getAngleBetweenVectors( startPosition, endPosition );
    assert && assert( !isNaN( angle ), 'angle should be a number' );
    matrix.setToTranslationRotationPoint( translation, angle );
  }

  /**
   * Returns true if this CircuitElement contains the specified scalar position.
   * @param {number} scalarPosition
   * @returns {boolean}
   * @public
   */
  containsScalarPosition( scalarPosition: number ) {
    return scalarPosition >= 0 && scalarPosition <= this.chargePathLength;
  }

  /**
   * Get all Property instances that influence the circuit dynamics.
   * @abstract must be specified by the subclass
   * @returns {Property.<*>[]}
   * @public
   */
  abstract getCircuitProperties(): Property<any>[] // TODO: parameter

  /**
   * Get the midpoint between the vertices.  Used for dropping circuit elements into the toolbox.
   * @returns {Vector2}
   * @public
   */
  getMidpoint() {
    const start = this.startVertexProperty.value.positionProperty.get();
    const end = this.endVertexProperty.value.positionProperty.get();
    return start.average( end );
  }

  // @public
  toVertexString() {
    return `${this.startVertexProperty.value.index} -> ${this.endVertexProperty.value.index}`;
  }
}

const VertexReferenceIO = ReferenceIO( Vertex.VertexIO );

// @public {IOType}
CircuitElement.CircuitElementIO = new IOType( 'CircuitElementIO', {
  valueType: CircuitElement,
  documentation: 'A Circuit Element, such as battery, resistor or wire',
  toStateObject: ( circuitElement: CircuitElement ) => ( {
    startVertexID: VertexReferenceIO.toStateObject( circuitElement.startVertexProperty.value ),
    endVertexID: VertexReferenceIO.toStateObject( circuitElement.endVertexProperty.value )
  } ),
  stateSchema: {
    startVertexID: VertexReferenceIO,
    endVertexID: VertexReferenceIO
  },
  stateToArgsForConstructor: ( stateObject: any ) => {
    return [
      VertexReferenceIO.fromStateObject( stateObject.startVertexID ),
      VertexReferenceIO.fromStateObject( stateObject.endVertexID )
    ];
  }
} );

const getSenseForPositive = ( current: number ) => current < 0 ? 'backward' :
                                                   current > 0 ? 'forward' :
                                                   'unspecified';
const getSenseForNegative = ( current: number ) => current < 0 ? 'forward' :
                                                   current > 0 ? 'backward' :
                                                   'unspecified';

circuitConstructionKitCommon.register( 'CircuitElement', CircuitElement );
export { CircuitElementOptions };
export default CircuitElement;