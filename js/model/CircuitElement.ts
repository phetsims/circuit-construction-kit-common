// Copyright 2016-2023, University of Colorado Boulder

/**
 * CircuitElement is the base class for all elements that can be part of a circuit, including:
 * Wire, Resistor, Battery, LightBulb, Switch.  It has a start vertex and end vertex and a model for its own current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property, { PropertyOptions } from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { PressListenerEvent, SceneryEvent } from '../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import CurrentSense from './CurrentSense.js';
import Vertex from './Vertex.js';
import TReadOnlyProperty, { PropertyLinkListener } from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import TEmitter from '../../../axon/js/TEmitter.js';

// variables
let index = 0;

const VertexReferenceIO = ReferenceIO( Vertex.VertexIO );

type SelfOptions = {
  isFlammable?: boolean;
  isMetallic?: boolean;
  isSizeChangedOnViewChange?: boolean;
  isCurrentReentrant?: boolean;
  interactive?: boolean;
  insideTrueBlackBox?: boolean;

  isEditablePropertyOptions?: Pick<PropertyOptions<boolean>, 'tandem'>;
  isValueDisplayablePropertyOptions?: Pick<PropertyOptions<boolean>, 'tandem'>;
  labelStringPropertyOptions?: Pick<PropertyOptions<boolean>, 'tandem'>;
};

export type CircuitElementOptions = SelfOptions & PhetioObjectOptions;

export type CircuitElementState = {
  startVertexID: string;
  endVertexID: string;
};

export default abstract class CircuitElement extends PhetioObject {

  // unique identifier for looking up corresponding views
  public readonly id: number;

  // track the time of creation so it can't be dropped in the toolbox for 0.5 seconds see https://github.com/phetsims/circuit-construction-kit-common/issues/244
  private readonly creationTime: number;

  // flammable circuit elements can catch on fire
  public readonly isFlammable: boolean;

  // metallic circuit elements behave like exposed wires--sensor values can be read directly on the resistor. For
  // instance, coins and paper clips and wires are metallic and can have their values read directly.
  public readonly isMetallic: boolean;

  // whether the size changes when changing from lifelike/schematic, used to determine whether the highlight region
  // should be changed.  True for everything except the switch.
  public readonly isSizeChangedOnViewChange: boolean;

  // the Vertex at the origin of the CircuitElement, may change when CircuitElements are connected
  public readonly startVertexProperty: Property<Vertex>;

  // the Vertex at the end of the CircuitElement, may change when CircuitElements are connected
  public readonly endVertexProperty: Property<Vertex>;

  // the flowing current, in amps.
  public readonly currentProperty: Property<number>;
  public readonly currentSenseProperty: Property<CurrentSense>;

  // true if the CircuitElement can be edited and dragged
  public readonly interactiveProperty: BooleanProperty;

  // whether the circuit element is inside the true black box, not inside the user-created black box, on the interface
  // or outside of the black box
  public readonly insideTrueBlackBoxProperty: BooleanProperty;

  // true if the charge layout must be updated (each element is visited every frame to check this)
  public chargeLayoutDirty: boolean;

  // indicate when this CircuitElement has been connected to another CircuitElement
  public readonly connectedEmitter: TEmitter;

  // indicate when an adjacent Vertex has moved to front, so that the corresponding Node can move to front too
  public readonly vertexSelectedEmitter: TEmitter;

  // indicate when either Vertex has moved
  public readonly vertexMovedEmitter: TEmitter;

  // indicate when the CircuitElement has been moved to the front in z-ordering
  public readonly moveToFrontEmitter: TEmitter;

  // indicate when the circuit element has started being dragged, when it is created in the toolbox
  public readonly startDragEmitter: TEmitter<[ PressListenerEvent ]>;

  // indicate when the circuit element has been disposed
  public readonly disposeEmitterCircuitElement: TEmitter;
  private readonly vertexMovedListener: () => void;
  private readonly linkVertexListener: PropertyLinkListener<Vertex>;

  // named so it doesn't collide with the specified voltageProperty in Battery or ACVoltage
  public readonly voltageDifferenceProperty: NumberProperty;
  private readonly vertexVoltageListener: () => void;

  // (read-only by clients, writable-by-subclasses) {number} the distance the charges must take to get to the other side
  // of the component. This is typically the distance between vertices, but not for light bulbs.  This value is constant,
  // except for (a) wires which can have their length changed and (b) LightBulbs whose path length changes when switching
  // between LIFELIKE |SCHEMATIC
  public chargePathLength: number;

  // The ammeter update is called after items are disposed but before corresponding views are disposed, so we must
  // take care not to display current for any items that are pending deletion.
  // See https://github.com/phetsims/circuit-construction-kit-common/issues/418
  public circuitElementDisposed: boolean;

  public readonly lengthProperty: Property<number> | undefined;
  public readonly isEditableProperty: BooleanProperty;
  public readonly isDisposableProperty: BooleanProperty;
  public isValueDisplayableProperty: BooleanProperty;
  public labelStringProperty: StringProperty;

  public constructor( startVertex: Vertex, endVertex: Vertex, chargePathLength: number, tandem: Tandem, providedOptions?: CircuitElementOptions ) {
    assert && assert( startVertex !== endVertex, 'startVertex cannot be the same as endVertex' );
    assert && assert( chargePathLength > 0, 'charge path length must be positive' );

    const options = optionize<CircuitElementOptions, SelfOptions, PhetioObjectOptions>()( {
      interactive: true, // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
      isSizeChangedOnViewChange: true,
      insideTrueBlackBox: false,
      isMetallic: false, // Metallic items can have their voltage read directly (unshielded)
      isFlammable: false,
      tandem: tandem,
      isCurrentReentrant: false,
      phetioDynamicElement: true,
      phetioType: CircuitElement.CircuitElementIO,

      isEditablePropertyOptions: {},
      isValueDisplayablePropertyOptions: {},
      labelStringPropertyOptions: {}
    }, providedOptions );

    super( options );

    this.id = index++;
    this.creationTime = phet.joist.elapsedTime;
    this.isFlammable = options.isFlammable;
    this.isMetallic = options.isMetallic;
    this.isSizeChangedOnViewChange = options.isSizeChangedOnViewChange;

    this.startVertexProperty = new Property( startVertex, {
      phetioValueType: Vertex.VertexIO,
      tandem: tandem.createTandem( 'startVertexProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.endVertexProperty = new Property( endVertex, {
      phetioValueType: Vertex.VertexIO,
      tandem: tandem.createTandem( 'endVertexProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.currentProperty = new NumberProperty( 0, {
      reentrant: options.isCurrentReentrant,
      tandem: tandem.createTandem( 'currentProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioFeatured: true
    } );
    this.currentProperty.link( current => {
      assert && assert( !isNaN( current ) );
    } );

    // we assign the directionality based on the initial current direction, so the initial current is always positive.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/508
    this.currentSenseProperty = new EnumerationProperty( CurrentSense.UNSPECIFIED, {
      tandem: tandem.createTandem( 'currentSenseProperty' )
    } );

    this.interactiveProperty = new BooleanProperty( options.interactive );
    this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );
    this.chargeLayoutDirty = true;
    this.connectedEmitter = new Emitter();
    this.moveToFrontEmitter = new Emitter();
    this.vertexSelectedEmitter = new Emitter();
    this.vertexMovedEmitter = new Emitter();
    this.startDragEmitter = new Emitter( { parameters: [ { valueType: SceneryEvent } ] } );
    this.disposeEmitterCircuitElement = new Emitter();

    // Signify that a Vertex moved
    this.vertexMovedListener = this.emitVertexMoved.bind( this );

    // stored for disposal
    this.linkVertexListener = this.linkVertex.bind( this );

    this.startPositionProperty.link( this.vertexMovedListener );
    this.endPositionProperty.link( this.vertexMovedListener );

    this.voltageDifferenceProperty = new NumberProperty( this.computeVoltageDifference() );

    this.vertexVoltageListener = () => this.voltageDifferenceProperty.set( this.computeVoltageDifference() );

    this.startVertexProperty.link( this.linkVertexListener );
    this.endVertexProperty.link( this.linkVertexListener );
    this.chargePathLength = chargePathLength;
    this.circuitElementDisposed = false;
    this.lengthProperty = undefined;

    // PhET-iO-specific Properties
    this.isEditableProperty = new BooleanProperty( true, combineOptions<PropertyOptions<boolean>>( {
      tandem: tandem.createTandem( 'isEditableProperty' ),
      phetioDocumentation: 'Whether the CircuitElement can have its numerical characteristics changed by the user',
      phetioFeatured: true
    }, options.isEditablePropertyOptions ) );

    this.isDisposableProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isDisposableProperty' ),
      phetioDocumentation: 'Whether the CircuitElement can be disposed. Set this to false to make the CircuitElement persisent',
      phetioFeatured: true
    } );

    this.isValueDisplayableProperty = new BooleanProperty( true, combineOptions<PropertyOptions<boolean>>( {
      tandem: tandem.createTandem( 'isValueDisplayableProperty' ),
      phetioDocumentation: 'Whether the CircuitElement\'s value can be displayed when the "values" checkbox is selected',
      phetioFeatured: true
    }, options.isValueDisplayablePropertyOptions ) );

    this.labelStringProperty = new StringProperty( '', combineOptions<PropertyOptions<string>>( {
      tandem: tandem.createTandem( 'labelStringProperty' ),
      phetioDocumentation: 'Shows a custom text label next to the circuit element',
      phetioFeatured: true
    }, options.labelStringPropertyOptions ) );
  }

  /**
   * Determine the voltage difference between end vertex and start vertex
   */
  private computeVoltageDifference(): number {
    return this.endVertexProperty.value.voltageProperty.value -
           this.startVertexProperty.value.voltageProperty.value;
  }

  /**
   * When the start or end Vertex changes, move the listeners from the old Vertex to the new one
   * @param newVertex - the new vertex
   * @param oldVertex - the previous vertex
   * @param property
   */
  private linkVertex( newVertex: Vertex, oldVertex: Vertex | null, property: TReadOnlyProperty<Vertex> ): void {

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
   * Steps forward in time
   */
  public step( time: number, dt: number, circuit: Circuit ): void {
    // See subclass for implementation
  }

  /**
   * Convenience method to get the start vertex position Property
   */
  public get startPositionProperty(): Property<Vector2> {
    return this.startVertexProperty.get().positionProperty;
  }

  /**
   * Convenience method to get the end vertex position Property
   */
  public get endPositionProperty(): Property<Vector2> {
    return this.endVertexProperty.get().positionProperty;
  }

  /**
   * Signify that a vertex has moved.
   */
  private emitVertexMoved(): void {

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
   */
  public override dispose(): void {
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

    this.isEditableProperty.dispose();
    this.isDisposableProperty.dispose();
    this.isValueDisplayableProperty.dispose();
    this.startVertexProperty.dispose();
    this.endVertexProperty.dispose();
    this.labelStringProperty.dispose();
    this.currentSenseProperty.dispose();
    this.currentProperty.dispose();

    super.dispose();
  }

  /**
   * Replace one of the vertices with a new one, when CircuitElements are connected.
   * @param oldVertex - the vertex which will be replaced.
   * @param newVertex - the vertex which will take the place of oldVertex.
   */
  public replaceVertex( oldVertex: Vertex, newVertex: Vertex ): void {
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
   */
  public getOppositeVertex( vertex: Vertex ): Vertex {
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
   */
  public containsVertex( vertex: Vertex ): boolean {
    return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
  }

  /**
   * Returns true if this CircuitElement contains both Vertex instances.
   */
  public containsBothVertices( vertex1: Vertex, vertex2: Vertex ): boolean {
    return this.containsVertex( vertex1 ) && this.containsVertex( vertex2 );
  }

  /**
   * Updates the given matrix with the position and angle at the specified position along the element.
   * @param distanceAlongWire - the scalar distance from one endpoint to another.
   * @param matrix to be updated with the position and angle, so that garbage isn't created each time
   */
  public updateMatrixForPoint( distanceAlongWire: number, matrix: Matrix3 ): void {
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
   */
  public containsScalarPosition( scalarPosition: number ): boolean {
    return scalarPosition >= 0 && scalarPosition <= this.chargePathLength;
  }

  /**
   * Get all Property instances that influence the circuit dynamics.
   */
  public abstract getCircuitProperties(): Property<IntentionalAny>[];

  /**
   * Get the midpoint between the vertices.  Used for dropping circuit elements into the toolbox.
   */
  public getMidpoint(): Vector2 {
    const start = this.startVertexProperty.value.positionProperty.get();
    const end = this.endVertexProperty.value.positionProperty.get();
    return start.average( end );
  }

  private toVertexString(): string {
    return `${this.startVertexProperty.value.index} -> ${this.endVertexProperty.value.index}`;
  }

  public static readonly CircuitElementIO = new IOType<CircuitElement, CircuitElementState>( 'CircuitElementIO', {

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
    stateObjectToCreateElementArguments: ( stateObject: CircuitElementState ) => {
      return [
        VertexReferenceIO.fromStateObject( stateObject.startVertexID ),
        VertexReferenceIO.fromStateObject( stateObject.endVertexID )
      ];
    }
  } );
}

circuitConstructionKitCommon.register( 'CircuitElement', CircuitElement );