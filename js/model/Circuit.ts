// Copyright 2015-2023, University of Colorado Boulder

/**
 * A collection of circuit elements in the play area, not necessarily connected.  (For instance it could be 2 disjoint
 * circuits). This exists for the life of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import createObservableArray, { ObservableArray } from '../../../axon/js/createObservableArray.js';
import Property from '../../../axon/js/Property.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Vector2 from '../../../dot/js/Vector2.js';
import PhetioGroup from '../../../tandem/js/PhetioGroup.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from './ACVoltage.js';
import Battery from './Battery.js';
import Capacitor from './Capacitor.js';
import Charge from './Charge.js';
import ChargeAnimator from './ChargeAnimator.js';
import CircuitElement from './CircuitElement.js';
import CurrentType from './CurrentType.js';
import DynamicCircuitElement from './DynamicCircuitElement.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import Fuse from './Fuse.js';
import Inductor from './Inductor.js';
import LightBulb from './LightBulb.js';
import LinearTransientAnalysis from './analysis/LinearTransientAnalysis.js';
import Resistor from './Resistor.js';
import SeriesAmmeter from './SeriesAmmeter.js';
import Switch from './Switch.js';
import Vertex from './Vertex.js';
import Wire from './Wire.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import VoltageConnection from './VoltageConnection.js';
import ResistorType from './ResistorType.js';
import InteractionMode from './InteractionMode.js';
import CurrentSense from './CurrentSense.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import OrIO from '../../../tandem/js/types/OrIO.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import { PhetioState } from '../../../tandem/js/TandemConstants.js';

// constants
const SNAP_RADIUS = 30; // For two vertices to join together, they must be this close, in view coordinates
const BUMP_AWAY_RADIUS = 20; // If two vertices are too close together after one is released, and they could not be
// joined then bump them apart so they do not look connected.

const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
const WIRE_LENGTH = CCKCConstants.WIRE_LENGTH;

// Determine what sense a circuit element should have to create an overall positive readout, given the specified current
const getSenseForPositive = ( current: number ) => current < 0 ? CurrentSense.BACKWARD :
                                                   current > 0 ? CurrentSense.FORWARD :
                                                   CurrentSense.UNSPECIFIED;

// Determine what sense a circuit element should have to create an overall negative readout, given the specified current
const getSenseForNegative = ( current: number ) => current < 0 ? CurrentSense.FORWARD :
                                                   current > 0 ? CurrentSense.BACKWARD :
                                                   CurrentSense.UNSPECIFIED;

const trueFunction = _.constant( true ); // Lower cased so IDEA doesn't think it is a constructor

type CircuitOptions = {
  blackBoxStudy: boolean;
  includeACElements: boolean;
  includeLabElements: boolean;
};

type Pair = { v1: Vertex; v2: Vertex };

export default class Circuit extends PhetioObject {
  private readonly viewTypeProperty: Property<CircuitElementViewType>;
  public readonly addRealBulbsProperty: Property<boolean>;
  private readonly blackBoxStudy: boolean;

  // All wires share the same resistivity, which is defined by resistance = resistivity * length. On the Lab Screen,
  // there is a wire resistivity control
  public readonly wireResistivityProperty: NumberProperty;

  // All batteries share a single internal resistance value, which can be edited with a control on the Lab Screen
  public readonly sourceResistanceProperty: NumberProperty;

  // The different types of CircuitElement the circuit may contain, including Wire, Battery, Switch, Resistor, LightBulb, etc.
  public readonly circuitElements: ObservableArray<CircuitElement>;

  // The charges in the circuit
  public readonly charges: ObservableArray<Charge>;

  // whether the current should be displayed
  public readonly showCurrentProperty: BooleanProperty;

  // whether to show charges or conventional current
  public readonly currentTypeProperty: Property<CurrentType>;

  // elapsed time for the circuit model
  public readonly timeProperty: NumberProperty;

  // move the charges with speed proportional to current
  public readonly chargeAnimator: ChargeAnimator;

  // After the circuit physics is recomputed in solve(), some listeners need to update themselves, such as the voltmeter
  // and ammeter
  public readonly circuitChangedEmitter: TEmitter;

  // Some actions only take place after an item has been dropped
  public readonly vertexDroppedEmitter: TEmitter<[ Vertex ]>;

  // signifies that a component has been modified (for example, with the CircuitElementNumberControl)
  public readonly componentEditedEmitter: TEmitter;
  public readonly vertexGroup: PhetioGroup<Vertex, [ Vector2 ]>;

  // When the user taps on a CircuitElement, it becomes selected and highlighted, and shows additional controls at the
  // bottom of the screen. When the sim launches or when the user taps away from a selected circuit element, the
  // selection is `null`.  Once this simulation is instrumented for a11y, the focus property can be used to track this.
  // Note that vertex selection is done via Vertex.isSelectedProperty.  These strategies can be unified when we work on
  // a11y.
  public readonly selectionProperty: Property<CircuitElement | Vertex | null>;

  // whether physical characteristics have changed and warrant solving for currents and voltages
  public dirty: boolean;

  // Actions that will be invoked during the step function
  private readonly stepActions: ( () => void )[];
  public readonly wireGroup: PhetioGroup<Wire, [ Vertex, Vertex ]>;
  public readonly batteryGroup: PhetioGroup<Battery, [ Vertex, Vertex ]>;
  public readonly extremeBatteryGroup: PhetioGroup<Battery, [ Vertex, Vertex ]> | null;
  public readonly acVoltageGroup: PhetioGroup<ACVoltage, [ Vertex, Vertex ]> | null;
  public readonly resistorGroup: PhetioGroup<Resistor, [ Vertex, Vertex ]>;
  public readonly extremeResistorGroup: PhetioGroup<Resistor, [ Vertex, Vertex ]> | null;
  public readonly householdObjectGroup: PhetioGroup<Resistor, [ Vertex, Vertex, ResistorType ]>;
  public readonly fuseGroup: PhetioGroup<Fuse, [ Vertex, Vertex ]>;
  public readonly seriesAmmeterGroup: PhetioGroup<SeriesAmmeter, [ Vertex, Vertex ]> | null;
  public readonly extremeLightBulbGroup: PhetioGroup<LightBulb, [ Vertex, Vertex ]> | null;
  public readonly capacitorGroup: PhetioGroup<Capacitor, [ Vertex, Vertex ]> | null;
  public readonly inductorGroup: PhetioGroup<Inductor, [ Vertex, Vertex ]> | null;
  public readonly switchGroup: PhetioGroup<Switch, [ Vertex, Vertex ]>;
  public readonly lightBulbGroup: PhetioGroup<LightBulb, [ Vertex, Vertex ]>;
  public readonly realLightBulbGroup: PhetioGroup<LightBulb, [ Vertex, Vertex ]> | null;
  private readonly groups: PhetioGroup<IntentionalAny, IntentionalAny>[];
  public readonly includeACElements: boolean;
  public readonly includeLabElements: boolean;

  public constructor( viewTypeProperty: Property<CircuitElementViewType>, addRealBulbsProperty: Property<boolean>, tandem: Tandem,
                      providedOptions: CircuitOptions ) {

    super( {
      tandem: tandem,
      phetioType: CircuitStateIO,

      // Used for get/set for the circuit on one screen but the entire state is already instrumented via the PhetioGroups
      phetioState: false
    } );

    this.viewTypeProperty = viewTypeProperty;
    this.addRealBulbsProperty = addRealBulbsProperty;

    const options = providedOptions;

    this.includeACElements = options.includeACElements;
    this.includeLabElements = options.includeLabElements;
    this.blackBoxStudy = options.blackBoxStudy;
    this.wireResistivityProperty = new NumberProperty( CCKCConstants.WIRE_RESISTIVITY_RANGE.min, {
      tandem: tandem.parentTandem!.createTandem( 'wireResistivityProperty' ),
      range: CCKCConstants.WIRE_RESISTIVITY_RANGE,
      phetioFeatured: true
    } );

    this.sourceResistanceProperty = new NumberProperty( CCKCConstants.DEFAULT_BATTERY_RESISTANCE, {
      tandem: tandem.parentTandem!.createTandem( 'sourceResistanceProperty' ),
      range: CCKCConstants.BATTERY_RESISTANCE_RANGE,
      phetioFeatured: true
    } );

    this.circuitElements = createObservableArray( {
      phetioState: true,
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( CircuitElement.CircuitElementIO ) ),
      tandem: tandem.createTandem( 'circuitElements' ),
      phetioDocumentation: 'All Circuit Elements, used for state save/restore',
      phetioFeatured: true
    } );

    this.charges = createObservableArray();
    this.currentTypeProperty = new EnumerationProperty( CCKCQueryParameters.currentType === 'electrons' ?
                                                        CurrentType.ELECTRONS : CurrentType.CONVENTIONAL, {
      tandem: tandem.parentTandem!.createTandem( 'currentTypeProperty' ),
      phetioFeatured: true
    } );

    // When the current type changes, mark everything as dirty and relayout charges
    this.currentTypeProperty.lazyLink( () => this.relayoutAllCharges() );

    this.showCurrentProperty = new BooleanProperty( CCKCQueryParameters.showCurrent, {
      tandem: tandem.parentTandem!.createTandem( 'showCurrentProperty' ),
      phetioFeatured: true
    } );

    this.timeProperty = new NumberProperty( 0 );
    this.chargeAnimator = new ChargeAnimator( this );

    // Mark as dirty when voltages or resistances change.
    const markDirtyListener = this.markDirty.bind( this );

    // Solve the circuit when any of the circuit element attributes change.
    this.circuitElements.addItemAddedListener( circuitElement => {
      circuitElement.getCircuitProperties().forEach( property => property.lazyLink( markDirtyListener ) );
      if ( circuitElement instanceof DynamicCircuitElement ) {
        circuitElement.clearEmitter.addListener( markDirtyListener );
        circuitElement.disposeEmitterCircuitElement.addListener( () => {
          circuitElement.clearEmitter.removeListener( markDirtyListener );
        } );
      }

      // When any vertex moves, relayout all charges within the fixed-length connected component, see #100
      circuitElement.chargeLayoutDirty = true;

      const updateCharges = () => this.markAllConnectedCircuitElementsDirty( circuitElement.startVertexProperty.get() );

      // For circuit elements that can change their length, make sure to update charges when the length changes.
      if ( circuitElement.lengthProperty ) {
        circuitElement.lengthProperty.link( updateCharges );
        circuitElement.disposeEmitterCircuitElement.addListener( () => circuitElement.lengthProperty!.unlink( updateCharges ) );
      }
      this.markDirty();
      circuitElement.currentSenseProperty.lazyLink( emitCircuitChanged );
    } );
    this.circuitElements.addItemRemovedListener( circuitElement => {

      // Delete orphaned vertices
      this.removeVertexIfOrphaned( circuitElement.startVertexProperty.get() );
      this.removeVertexIfOrphaned( circuitElement.endVertexProperty.get() );

      // Clear the selected element property so that the Edit panel for the element will disappear
      if ( this.selectionProperty.get() === circuitElement ) {
        this.selectionProperty.value = null;
      }

      circuitElement.getCircuitProperties().forEach( property => property.unlink( markDirtyListener ) );
      this.charges.removeAll( this.getChargesInCircuitElement( circuitElement ) );
      circuitElement.currentSenseProperty.unlink( emitCircuitChanged );
      this.markDirty();
    } );

    // When a Charge is removed from the list, dispose it
    this.charges.addItemRemovedListener( charge => charge.dispose() );

    this.circuitChangedEmitter = new Emitter();
    this.vertexDroppedEmitter = new Emitter( { parameters: [ { valueType: Vertex } ] } );
    this.componentEditedEmitter = new Emitter();

    this.selectionProperty = new Property<CircuitElement | Vertex | null>( null, {
      tandem: tandem.createTandem( 'selectionProperty' ),
      phetioValueType: NullableIO( ReferenceIO( OrIO( [ CircuitElement.CircuitElementIO, Vertex.VertexIO ] ) ) ),
      phetioFeatured: true
    } );

    const emitCircuitChanged = () => {
      this.dirty = true;
      this.circuitChangedEmitter.emit();
    };

    this.vertexGroup = new PhetioGroup( ( tandem, position ) => {
      return new Vertex( position, this.selectionProperty, {
        tandem: tandem,
        phetioType: Vertex.VertexIO
      } );
    }, [ new Vector2( -1000, 0 ) ], {
      phetioType: PhetioGroup.PhetioGroupIO( Vertex.VertexIO ),
      tandem: tandem.createTandem( 'vertexGroup' )
    } );

    this.vertexGroup.elementCreatedEmitter.addListener( vertex => {

      // Observe the change in position of the vertices, to update the ammeter and voltmeter
      vertex.positionProperty.link( emitCircuitChanged );

      const filtered = this.vertexGroup.filter( candidateVertex => vertex === candidateVertex );
      assert && assert( filtered.length === 1, 'should only have one copy of each vertex' );

      // If the use dragged another circuit element, then previous selection should be cleared.
      this.selectionProperty.value = null;
    } );

    this.stepActions = [];

    // When any vertex is dropped, check it and its neighbors for overlap.  If any overlap, move them apart.
    this.vertexDroppedEmitter.addListener( vertex => {
      this.stepActions.push( () => {

        // Collect adjacent vertices
        const neighbors = this.getNeighboringVertices( vertex );

        // Also consider the vertex being dropped for comparison with neighbors
        neighbors.push( vertex );
        const pairs: Pair[] = [];
        neighbors.forEach( neighbor => {
          this.vertexGroup.forEach( vertex => {

            // Make sure nodes are different
            if ( neighbor !== vertex ) {

              // Add to the list to be checked
              pairs.push( { v1: neighbor, v2: vertex } );
            }
          } );
        } );
        if ( pairs.length > 0 ) {

          // Find the closest pair
          const distance = ( pair: Pair ) => pair.v2.unsnappedPositionProperty.get().distance( pair.v1.unsnappedPositionProperty.get() );
          const minPair = _.minBy( pairs, distance )!;
          const minDistance = distance( minPair );

          // If the pair is too close, then bump one vertex away from each other (but only if both are not user controlled)
          if ( minDistance < BUMP_AWAY_RADIUS && !minPair.v1.isDragged && !minPair.v2.isDragged ) {
            this.moveVerticesApart( minPair.v1, minPair.v2 );
          }
        }
      } );
    } );

    this.sourceResistanceProperty.link( markDirtyListener );

    // Create vertices for the API validated/baseline circuit elements.  These are not present in the vertexGroup and
    // hence not transmitted in the state.
    const createVertices: ( l: number ) => [ Vertex, Vertex ] = ( length: number ) => {
      const startPosition = new Vector2( -1000, 0 );
      return [ new Vertex( startPosition, this.selectionProperty ), new Vertex( startPosition.plusXY( length, 0 ), this.selectionProperty ) ];
    };

    this.wireGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
      return new Wire( startVertex, endVertex, this.wireResistivityProperty, tandem );
    }, () => createVertices( WIRE_LENGTH ), {
      phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
      tandem: tandem.createTandem( 'wireGroup' )
    } );

    this.batteryGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
      return new Battery( startVertex, endVertex, this.sourceResistanceProperty, 'normal',
        tandem );
    }, () => createVertices( BATTERY_LENGTH ), {
      phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
      tandem: tandem.createTandem( 'batteryGroup' )
    } );

    const includeExtremeElements = this.includeLabElements && !this.includeACElements;
    this.extremeBatteryGroup = includeExtremeElements ? new PhetioGroup( ( tandem, startVertex, endVertex ) => {
      return new Battery( startVertex, endVertex, this.sourceResistanceProperty, 'high-voltage',
        tandem, {
          voltage: 1000,
          numberOfDecimalPlaces: Battery.HIGH_VOLTAGE_DECIMAL_PLACES
        } );
    }, () => createVertices( BATTERY_LENGTH ), {
      phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
      tandem: tandem.createTandem( 'extremeBatteryGroup' ),
      phetioDynamicElementName: 'extremeBattery'
    } ) : null;

    this.acVoltageGroup = this.includeACElements ? new PhetioGroup( ( tandem, startVertex, endVertex ) => {
      return new ACVoltage( startVertex, endVertex, this.sourceResistanceProperty, tandem );
    }, () => createVertices( CCKCConstants.AC_VOLTAGE_LENGTH ), {
      phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
      tandem: tandem.createTandem( 'acVoltageGroup' )
    } ) : null;

    this.resistorGroup = new PhetioGroup(
      ( tandem, startVertex, endVertex ) =>
        new Resistor( startVertex, endVertex, ResistorType.RESISTOR, tandem ),
      () => createVertices( ResistorType.RESISTOR.length ), {
        phetioType: PhetioGroup.PhetioGroupIO( Resistor.ResistorIO ),
        tandem: tandem.createTandem( 'resistorGroup' )
      } );

    this.extremeResistorGroup = includeExtremeElements ? new PhetioGroup(
      ( tandem, startVertex, endVertex ) =>
        new Resistor( startVertex, endVertex, ResistorType.EXTREME_RESISTOR, tandem ),
      () => createVertices( ResistorType.EXTREME_RESISTOR.length ), {
        phetioType: PhetioGroup.PhetioGroupIO( Resistor.ResistorIO ),
        tandem: tandem.createTandem( 'extremeResistorGroup' )
      } ) : null;

    this.householdObjectGroup = new PhetioGroup(
      ( tandem, startVertex, endVertex, resistorType ) =>
        new Resistor( startVertex, endVertex, resistorType, tandem ),
      () => {
        return [ ...createVertices( ResistorType.RESISTOR.length ), ResistorType.COIN ];
      }, {
        phetioType: PhetioGroup.PhetioGroupIO( Resistor.ResistorIO ),
        tandem: tandem.createTandem( 'householdObjectGroup' )
      } );

    this.fuseGroup = new PhetioGroup(
      ( tandem, startVertex, endVertex ) => new Fuse( startVertex, endVertex, tandem ),
      () => createVertices( CCKCConstants.FUSE_LENGTH ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'fuseGroup' )
      } );

    this.seriesAmmeterGroup = this.includeLabElements ? new PhetioGroup(
      ( tandem, startVertex, endVertex ) => new SeriesAmmeter( startVertex, endVertex, tandem ),
      () => createVertices( CCKCConstants.SERIES_AMMETER_LENGTH ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'seriesAmmeterGroup' )
      } ) : null;

    this.extremeLightBulbGroup = includeExtremeElements ? new PhetioGroup(
      ( tandem, startVertex, endVertex ) => {
        return LightBulb.createAtPosition( startVertex, endVertex, this, CCKCConstants.HIGH_RESISTANCE,
          this.viewTypeProperty, tandem, {
            isExtreme: true
          } );
      }, () => createVertices( 100 ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'extremeLightBulbGroup' )
      } ) : null;

    this.capacitorGroup = this.includeACElements ? new PhetioGroup(
      ( tandem, startVertex, endVertex ) => new Capacitor( startVertex, endVertex, tandem ),
      () => createVertices( CCKCConstants.CAPACITOR_LENGTH ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'capacitorGroup' )
      } ) : null;

    this.inductorGroup = this.includeACElements ? new PhetioGroup(
      ( tandem, startVertex, endVertex ) => new Inductor( startVertex, endVertex, tandem ),
      () => createVertices( CCKCConstants.INDUCTOR_LENGTH ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'inductorGroup' )
      } ) : null;

    this.switchGroup = new PhetioGroup(
      ( tandem, startVertex, endVertex ) => new Switch( startVertex, endVertex, tandem, this ),
      () => createVertices( CCKCConstants.SWITCH_LENGTH ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'switchGroup' )
      } );

    this.lightBulbGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
      return new LightBulb( startVertex, endVertex, CCKCConstants.DEFAULT_RESISTANCE, this.viewTypeProperty, tandem );
    }, () => createVertices( 100 ), {
      phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
      tandem: tandem.createTandem( 'lightBulbGroup' )
    } );

    this.realLightBulbGroup = ( this.includeLabElements && !this.includeACElements ) ? new PhetioGroup(
      ( tandem, startVertex, endVertex ) => {
        return new LightBulb( startVertex, endVertex, CCKCConstants.DEFAULT_RESISTANCE, this.viewTypeProperty, tandem, {
          isReal: true,
          isEditablePropertyOptions: {
            tandem: Tandem.OPT_OUT
          }
        } );
      }, () => createVertices( 100 ), {
        phetioType: PhetioGroup.PhetioGroupIO( CircuitElement.CircuitElementIO ),
        tandem: tandem.createTandem( 'realLightBulbGroup' )
      } ) : null;

    this.groups = [
      this.wireGroup,
      this.batteryGroup,
      this.resistorGroup,
      this.switchGroup,
      this.lightBulbGroup,
      this.fuseGroup,
      this.householdObjectGroup,
      ...( this.extremeBatteryGroup ? [ this.extremeBatteryGroup ] : [] ),
      ...( this.extremeResistorGroup ? [ this.extremeResistorGroup ] : [] ),
      ...( this.extremeLightBulbGroup ? [ this.extremeLightBulbGroup ] : [] ),
      ...( this.realLightBulbGroup ? [ this.realLightBulbGroup ] : [] ),
      ...( this.seriesAmmeterGroup ? [ this.seriesAmmeterGroup ] : [] ),
      ...( this.acVoltageGroup ? [ this.acVoltageGroup ] : [] ),
      ...( this.capacitorGroup ? [ this.capacitorGroup ] : [] ),
      ...( this.inductorGroup ? [ this.inductorGroup ] : [] )
    ];

    this.dirty = false;
  }

  public disposeCircuitElement( circuitElement: CircuitElement ): void {
    this.circuitElements.remove( circuitElement );

    // Find the corresponding group that contains the circuitElement and dispose it.
    this.groups.forEach( group => group.includes( circuitElement ) && group.disposeElement( circuitElement ) );
  }

  /**
   * Create a pair of vertices to be used for a new CircuitElement
   * @param position - the position of the center of the CircuitElement
   * @param length - the distance between the vertices
   * @returns with 2 elements
   */
  public createVertexPairArray( position: Vector2, length: number ): [ Vertex, Vertex ] {
    return [
      this.createVertex( position.plusXY( -length / 2, 0 ) ),
      this.createVertex( position.plusXY( length / 2, 0 ) )
    ];
  }

  /**
   * Create a Vertex at the specified position, convenience function for creating the vertices for CircuitElements.
   * @param position - the position of the Vertex in view = model coordinates
   */
  private createVertex( position: Vector2 ): Vertex {
    return this.vertexGroup.createNextElement( position );
  }

  /**
   * When over Vertex is released or bumped over another Vertex, rotate one away so it doesn't appear connected.
   */
  private moveVerticesApart( v1: Vertex, v2: Vertex ): void {
    const v1Neighbors = this.getNeighboringVertices( v1 );
    const v2Neighbors = this.getNeighboringVertices( v2 );

    // When vertex v1 is too close (but not connected) to v2, we choose vertex v3 as a reference point for moving
    // vertex v1 (or vice versa).
    if ( v1Neighbors.length === 1 && !v1.blackBoxInterfaceProperty.get() ) {
      this.bumpAwaySingleVertex( v1, v1Neighbors[ 0 ] ); // Arbitrarily choose 0th neighbor to move away from
    }
    else if ( v2Neighbors.length === 1 && !v2.blackBoxInterfaceProperty.get() ) {
      this.bumpAwaySingleVertex( v2, v2Neighbors[ 0 ] ); // Arbitrarily choose 0th neighbor to move away from
    }
  }

  // Update the position of all charges.
  public relayoutAllCharges(): void {
    this.circuitElements.forEach( circuitElement => {circuitElement.chargeLayoutDirty = true;} );
    this.layoutChargesInDirtyCircuitElements();
  }

  /**
   * When two Vertices are dropped/bumped too close together, move away the pre-existing one by rotating or
   * translating it.
   *
   * @param vertex - the vertex to rotate
   * @param pivotVertex - the vertex to rotate about
   */
  private bumpAwaySingleVertex( vertex: Vertex, pivotVertex: Vertex ): void {
    const distance = vertex.positionProperty.value.distance( pivotVertex.positionProperty.value );

    // If the vertices are too close, they must be translated away
    if ( distance < BUMP_AWAY_RADIUS ) {

      let difference = pivotVertex.positionProperty.value.minus( vertex.positionProperty.value );

      // Support when vertex is on the pivot, mainly for fuzz testing.  In that case, just move directly to the right
      if ( difference.magnitude === 0 ) {
        difference = new Vector2( 1, 0 );
      }

      const delta = difference.normalized().times( -SNAP_RADIUS * 1.5 );
      this.translateVertexGroup( vertex, delta );
    }
    else {

      // Other vertices should be rotated away, which handles non-stretchy components well. For small components like
      // batteries (which are around 100 view units long), rotate Math.PI/4. Longer components don't need to rotate
      // by such a large angle because the arc length will be proportionately longer,
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/344
      const searchAngle = Math.PI / 4 * 100 / distance;
      this.rotateSingleVertexByAngle( vertex, pivotVertex, searchAngle );
      const distance1 = this.closestDistanceToOtherVertex( vertex );
      this.rotateSingleVertexByAngle( vertex, pivotVertex, -2 * searchAngle );
      const distance2 = this.closestDistanceToOtherVertex( vertex );

      assert && assert( distance1 !== null && distance2 !== null );
      if ( distance2! <= distance1! ) {

        // go back to the best spot
        this.rotateSingleVertexByAngle( vertex, pivotVertex, 2 * searchAngle );
      }
    }
  }

  /**
   * Rotate the given Vertex about the specified Vertex by the given angle
   * @param vertex - the vertex which will be rotated
   * @param pivotVertex - the origin about which the vertex will rotate
   * @param deltaAngle - angle in radians to rotate
   */
  private rotateSingleVertexByAngle( vertex: Vertex, pivotVertex: Vertex, deltaAngle: number ): void {
    const position = vertex.positionProperty.get();
    const pivotPosition = pivotVertex.positionProperty.get();

    const distanceFromVertex = position.distance( pivotPosition );
    const angle = position.minus( pivotPosition ).angle;

    const newPosition = pivotPosition.plus( Vector2.createPolar( distanceFromVertex, angle + deltaAngle ) );
    vertex.unsnappedPositionProperty.set( newPosition );
    vertex.positionProperty.set( newPosition );
  }

  /**
   * Determine the distance to the closest Vertex
   * @param vertex
   * @returns - distance to nearest other Vertex in view coordinates
   */
  private closestDistanceToOtherVertex( vertex: Vertex ): number | null {
    let closestDistance = null;
    for ( let i = 0; i < this.vertexGroup.count; i++ ) {
      const v = this.vertexGroup.getElement( i );
      if ( v !== vertex ) {
        const distance = v.positionProperty.get().distance( vertex.positionProperty.get() );
        if ( closestDistance === null || distance < closestDistance ) {
          closestDistance = distance;
        }
      }
    }
    return closestDistance;
  }

  // Remove all elements from the circuit.
  private clear(): void {

    this.selectionProperty.reset();

    // Vertices must be cleared from the black box screen--it's not handled by clearing the circuit elements
    if ( this.blackBoxStudy ) {

      // clear references, do not dispose because some items get added back in the black box.
      this.circuitElements.clear();

      // Only dispose vertices not attached to the black box
      const toDispose = this.vertexGroup.filter( vertex => !vertex.blackBoxInterfaceProperty.value );
      toDispose.forEach( vertex => this.vertexGroup.disposeElement( vertex ) );

      this.markDirty();
    }
    else {

      this.circuitElements.clear();
      this.groups.forEach( group => group.clear() );
      this.vertexGroup.clear();
    }
  }

  /**
   * Split the Vertex into separate vertices.
   * @param vertex - the vertex to be cut.
   */
  public cutVertex( vertex: Vertex ): void {

    // Only permit cutting a non-dragged vertex, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
    if ( vertex.isDragged ) {
      return;
    }
    let neighborCircuitElements = this.getNeighborCircuitElements( vertex );
    if ( neighborCircuitElements.length <= 1 ) {

      // No work necessary for an unattached vertex
      return;
    }

    // Only move interactive circuit elements
    neighborCircuitElements = neighborCircuitElements.filter( circuitElement => circuitElement.interactiveProperty.get() );

    /**
     * Function that identifies where vertices would go if pulled toward their neighbors
     */
    const getTranslations = () => {
      return neighborCircuitElements.map( circuitElement => {
        const oppositePosition = circuitElement.getOppositeVertex( vertex ).positionProperty.get();
        const position = vertex.positionProperty.get();
        let delta = oppositePosition.minus( position );

        // If the vertices were at the same position, move them randomly.  See https://github.com/phetsims/circuit-construction-kit-common/issues/405
        if ( delta.magnitude === 0 ) {
          delta = Vector2.createPolar( 1, dotRandom.nextDouble() * Math.PI * 2 );
        }
        return delta.withMagnitude( 30 );
      } );
    };

    // Track where they would go if they moved toward their opposite vertices
    let translations = getTranslations();
    let angles = translations.map( t => t.angle );

    if ( neighborCircuitElements.length > 2 ) {

      // Reorder elements based on angle so they don't cross over when spread out
      neighborCircuitElements = _.sortBy( neighborCircuitElements, n => {
        const index = neighborCircuitElements.indexOf( n );
        return angles[ index ];
      } );

      // Get the angles in the corrected order
      translations = getTranslations();
      angles = translations.map( t => t.angle );
    }

    const separation = Math.PI * 2 / neighborCircuitElements.length;
    let results: Vector2[] = [];

    const centerAngle = _.sum( angles ) / angles.length;

    // Move vertices away from cut vertex so that wires don't overlap
    if ( neighborCircuitElements.length === 2 ) {

      const ax = Vector2.createPolar( 30, centerAngle - separation / neighborCircuitElements.length );
      const bx = Vector2.createPolar( 30, centerAngle + separation / neighborCircuitElements.length );

      const deltaAngle = angles[ 0 ] - centerAngle;

      results = deltaAngle < 0 ? [ ax, bx ] : [ bx, ax ];
    }
    else {
      const distance = neighborCircuitElements.length <= 5 ? 30 : neighborCircuitElements.length * 30 / 5;
      neighborCircuitElements.forEach( ( circuitElement, k ) => {
        results.push( Vector2.createPolar( distance, separation * k + angles[ 0 ] ) );
      } );
    }

    neighborCircuitElements.forEach( ( circuitElement, i ) => {

      // Add the new vertex to the model first so that it can be updated in subsequent calls
      const newVertex = this.vertexGroup.createNextElement( vertex.positionProperty.get() );

      circuitElement.replaceVertex( vertex, newVertex );

      // Bump the vertices away from the original vertex
      this.translateVertexGroup( newVertex, results[ i ] );
    } );

    if ( !vertex.blackBoxInterfaceProperty.get() ) {
      this.vertexGroup.disposeElement( vertex );
    }
    this.markDirty();
  }

  /**
   * Translate all vertices connected to the mainVertex by FixedCircuitElements by the given distance
   *
   * Note: do not confuse this with CircuitNode.translateVertexGroup which proposes connections while dragging
   *
   * @param mainVertex - the vertex whose group will be translated
   * @param delta - the vector by which to move the vertex group
   */
  private translateVertexGroup( mainVertex: Vertex, delta: Vector2 ): void {
    const vertexArray = this.findAllFixedVertices( mainVertex );

    for ( let j = 0; j < vertexArray.length; j++ ) {
      const vertex = vertexArray[ j ];

      // Only translate vertices that are movable and not connected to the black box interface by FixedLength elements
      if ( vertex.isDraggableProperty.get() && !this.hasFixedConnectionToBlackBoxInterfaceVertex( vertex ) ) {
        vertex.setPosition( vertex.positionProperty.value.plus( delta ) );
      }
    }
  }

  /**
   * Returns true if the given vertex has a fixed connection to a black box interface vertex.
   */
  private hasFixedConnectionToBlackBoxInterfaceVertex( vertex: Vertex ): boolean {
    const fixedVertices = this.findAllFixedVertices( vertex );
    return _.some( fixedVertices, fixedVertex => fixedVertex.blackBoxInterfaceProperty.get() );
  }

  /**
   * Returns true if the CircuitElement is not connected to any other CircuitElement.
   */
  public isSingle( circuitElement: CircuitElement ): boolean {
    return this.getNeighborCircuitElements( circuitElement.startVertexProperty.get() ).length === 1 &&
           this.getNeighborCircuitElements( circuitElement.endVertexProperty.get() ).length === 1;
  }

  /**
   * When removing a CircuitElement, also remove its start/end Vertex if it can be removed.
   */
  private removeVertexIfOrphaned( vertex: Vertex ): void {
    if (
      this.getNeighborCircuitElements( vertex ).length === 0 &&
      !vertex.blackBoxInterfaceProperty.get() &&
      !vertex.isDisposed
    ) {
      this.vertexGroup.disposeElement( vertex );
    }
  }

  /**
   * Get all of the CircuitElements that contain the given Vertex.
   */
  public getNeighborCircuitElements( vertex: Vertex ): CircuitElement[] {
    return this.circuitElements.filter( circuitElement => circuitElement.containsVertex( vertex ) );
  }

  /**
   * Get all of the CircuitElements that are connected to the given CircuitElement
   */
  private getNeighborCircuitElementsForCircuitElement( element: CircuitElement ): CircuitElement[] {
    return [ ...this.getNeighborCircuitElements( element.startVertexProperty.value ),
      ...this.getNeighborCircuitElements( element.endVertexProperty.value ) ].filter( el => {
      return el !== element;
    } );
  }

  /**
   * Gets the number of CircuitElements connected to the specified Vertex
   */
  public countCircuitElements( vertex: Vertex ): number {
    return this.circuitElements.count( circuitElement => circuitElement.containsVertex( vertex ) );
  }

  /**
   * Gets the voltage between two points.  Computed in the view because view coordinates are used in the computation.
   * @param redConnection
   * @param blackConnection
   * @param revealing - whether the black box is in "reveal" model
   */
  public getVoltageBetweenConnections( redConnection: VoltageConnection | null, blackConnection: VoltageConnection | null, revealing: boolean ): number | null {

    if ( redConnection === null || blackConnection === null ) {
      return null;
    }
    else if ( !this.areVerticesElectricallyConnected( redConnection.vertex, blackConnection.vertex ) ) {

      // Voltmeter probes each hit things but they were not connected to each other through the circuit.
      return null;
    }
    else if ( redConnection.vertex.insideTrueBlackBoxProperty.get() && !revealing ) {

      // Cannot read values inside the black box, unless "reveal" is being pressed
      return null;
    }
    else if ( blackConnection.vertex.insideTrueBlackBoxProperty.get() && !revealing ) {

      // Cannot read values inside the black box, unless "reveal" is being pressed
      return null;
    }
    else {
      return redConnection.voltage - blackConnection.voltage;
    }
  }

  /**
   * Determines whether the specified Vertices are electrically connected through any arbitrary connections.  An
   * open switch breaks the connection.
   */
  private areVerticesElectricallyConnected( vertex1: Vertex, vertex2: Vertex ): boolean {
    const connectedVertices = this.searchVertices( vertex1, ( startVertex, circuitElement ) => {

        // If the circuit element has a closed property (like a Switch), it is only OK to traverse if the element is
        // closed.
        if ( circuitElement instanceof Switch ) {
          return circuitElement.isClosedProperty.get();
        }
        else {

          // Everything else is traversible
          return true;
        }
      }
    );
    return connectedVertices.includes( vertex2 );
  }

  /**
   * When some physical characteristic has changed, we must recompute the voltages and currents.  Mark as
   * dirty and compute in step if anything has changed.
   */
  private markDirty(): void {
    this.dirty = true;
  }

  // Connect the vertices, merging oldVertex into vertex1 and deleting oldVertex
  public connect( targetVertex: Vertex, oldVertex: Vertex ): void {
    assert && assert( targetVertex.attachableProperty.get() && oldVertex.attachableProperty.get(),
      'both vertices should be attachable' );

    // Keep the black box vertices
    if ( oldVertex.blackBoxInterfaceProperty.get() ) {
      assert && assert( !targetVertex.blackBoxInterfaceProperty.get(), 'cannot attach black box interface vertex ' +
                                                                       'to black box interface vertex' );
      this.connect( oldVertex, targetVertex );
    }
    else {
      this.circuitElements.forEach( circuitElement => {
        if ( circuitElement.containsVertex( oldVertex ) ) {
          circuitElement.replaceVertex( oldVertex, targetVertex );
          circuitElement.connectedEmitter.emit();
        }
      } );

      // Inherit non-defaults

      // If either vertex was non-draggable, the resultant vertex should be non-draggable
      if ( !oldVertex.isDraggableProperty.value ) {
        targetVertex.isDraggableProperty.value = oldVertex.isDraggableProperty.value;
      }

      // If either vertex was non-cuttable, the resultant vertex should be non-cuttable
      if ( !oldVertex.isCuttableProperty.value ) {
        targetVertex.isCuttableProperty.value = oldVertex.isCuttableProperty.value;
      }

      // If the dragged vertex had no label, take the label of the replaced vertex
      if ( targetVertex.labelStringProperty.value === '' ) {
        targetVertex.labelStringProperty.value = oldVertex.labelStringProperty.value;
      }

      this.vertexGroup.disposeElement( oldVertex );
      assert && assert( !oldVertex.positionProperty.hasListeners(), 'Removed vertex should not have any listeners' );
      this.markDirty();

      // Make sure the solder is displayed in the correct z-order
      targetVertex.relayerEmitter.emit();
    }
  }

  /**
   * Move forward in time
   * @param dt - the elapsed time in seconds
   */
  public step( dt: number ): void {

    // Invoke any scheduled actions
    this.stepActions.forEach( stepAction => stepAction() );
    this.stepActions.length = 0;

    // Move forward time
    this.timeProperty.value += dt;

    const stepElements = this.circuitElements.filter( element => element.step );
    const dynamicElements = this.circuitElements.filter( element => element instanceof DynamicCircuitElement );
    stepElements.forEach( element => element.step( this.timeProperty.value, dt, this ) );

    if ( this.dirty || stepElements.length > 0 || dynamicElements.length > 0 ) {
      LinearTransientAnalysis.solveModifiedNodalAnalysis( this, dt );
      this.dirty = false;

      // check the incoming and outgoing current to each inductor.  If it is all 0, then clear the inductor.
      const inductors = this.circuitElements.filter( element => element instanceof Inductor ) as Inductor[];
      inductors.forEach( ( inductor: Inductor ) => {

        const hasCurrent = ( vertex: Vertex ) => {
          const neighborsWithCurrent = this.getNeighborCircuitElements( vertex )
            .filter( neighbor => neighbor !== inductor )
            .filter( neighbor => Math.abs( neighbor.currentProperty.value ) > 1E-4 );
          return neighborsWithCurrent.length > 0;
        };

        if ( !hasCurrent( inductor.startVertexProperty.value ) && !hasCurrent( inductor.endVertexProperty.value ) ) {
          inductor.clear();
        }
      } );

      this.circuitChangedEmitter.emit();
    }

    this.determineSenses();

    // Move the charges.  Do this after the circuit has been solved so the conventional current will have the correct
    // current values.
    this.chargeAnimator.step( dt );
  }

  /**
   * When a circuit element is marked as dirty (such as when it changed length or moved), it needs to have
   * the charges repositioned, so they will be equally spaced internally and spaced well compared to neighbor
   * elements.
   */
  public layoutChargesInDirtyCircuitElements(): void {
    this.circuitElements.forEach( circuitElement => this.layoutCharges( circuitElement ) );
  }

  /**
   * Determine if one Vertex is adjacent to another Vertex.  The only way for two vertices to be adjacent is for them
   * to be the start/end of a single CircuitElement
   */
  private isVertexAdjacent( a: Vertex, b: Vertex ): boolean {

    // A vertex cannot be adjacent to itself.
    if ( a === b ) {
      return false;
    }

    return this.circuitElements.some( circuitElement => circuitElement.containsBothVertices( a, b ) );
  }

  /**
   * Find the neighbor vertices within the given group of circuit elements
   * @param vertex
   * @param circuitElements - the group of CircuitElements within which to look for neighbors
   */
  private getNeighborVerticesInGroup( vertex: Vertex, circuitElements: CircuitElement[] ): Vertex[] {
    const neighbors = [];
    for ( let i = 0; i < circuitElements.length; i++ ) {
      const circuitElement = circuitElements[ i ];
      if ( circuitElement.containsVertex( vertex ) ) {
        neighbors.push( circuitElement.getOppositeVertex( vertex ) );
      }
    }
    return neighbors;
  }

  /**
   * Get an array of all the vertices adjacent to the specified Vertex.
   * @param vertex - the vertex to get neighbors for
   */
  public getNeighboringVertices( vertex: Vertex ): Vertex[] {
    const neighborCircuitElements = this.getNeighborCircuitElements( vertex );
    return this.getNeighborVerticesInGroup( vertex, neighborCircuitElements );
  }

  /**
   * Marks all connected circuit elements as dirty (so electrons will be layed out again), called when any wire length is changed.
   */
  private markAllConnectedCircuitElementsDirty( vertex: Vertex ): void {
    const allConnectedVertices = this.findAllConnectedVertices( vertex );

    // This is called many times while dragging a wire vertex, so for loops (as opposed to functional style) are used
    // to avoid garbage
    for ( let i = 0; i < allConnectedVertices.length; i++ ) {
      const neighborCircuitElements = this.getNeighborCircuitElements( allConnectedVertices[ i ] );
      for ( let k = 0; k < neighborCircuitElements.length; k++ ) {

        // Note the same circuit element may be marked dirty twice, but this does not cause any problems.
        neighborCircuitElements[ k ].chargeLayoutDirty = true;
      }
    }
    this.dirty = true;
  }

  /**
   * Find the subgraph where all vertices are connected by any kind of CircuitElements
   */
  public findAllConnectedVertices( vertex: Vertex ): Vertex[] {
    return this.searchVertices( vertex, trueFunction );
  }

  // Identify current senses for CurrentSense.UNSPECIFIED CircuitElements with a nonzero current
  private determineSenses(): void {

    // Disconnected circuit elements forget their sense
    this.circuitElements.forEach( c => {
      if ( c.currentProperty.value === 0.0 ) {
        c.currentSenseProperty.value = CurrentSense.UNSPECIFIED;
      }
    } );

    // Filter based on whether CircuitElements have current beforehand, currents cannot change in this loop
    const circuitElementsWithCurrent = this.circuitElements.filter( c => c.currentProperty.value !== 0 );

    // After assigning a sense, revisit the circuit to propagate senses.  Break out of the loop when no more work can be done
    while ( true ) { // eslint-disable-line no-constant-condition

      const requiresSenseBeforeVisit = circuitElementsWithCurrent.filter( c => c.currentSenseProperty.value === CurrentSense.UNSPECIFIED );
      if ( requiresSenseBeforeVisit.length === 0 ) {
        break;
      }

      // Propagate known senses to new circuit elements.
      this.propagateSenses();

      const requiresSenseAfterVisit = circuitElementsWithCurrent.filter( c => c.currentSenseProperty.value === CurrentSense.UNSPECIFIED );

      if ( requiresSenseAfterVisit.length === 0 ) {
        break;
      }

      let wasSenseAssigned = false;

      // Match AC Sources so they are in phase
      const unspecifiedACSources = requiresSenseAfterVisit.filter( r => r instanceof ACVoltage );
      if ( unspecifiedACSources.length > 0 ) {
        const unspecifiedACSource = unspecifiedACSources[ 0 ];
        const referenceElements = this.circuitElements.filter( c => c instanceof ACVoltage && c.currentSenseProperty.value !== CurrentSense.UNSPECIFIED && c !== unspecifiedACSource );
        if ( referenceElements.length > 0 ) {
          Circuit.assignSense( unspecifiedACSource, referenceElements[ 0 ] );
          wasSenseAssigned = true;

          // Run the next iteration of the loop, which will search out from the newly marked node
          // TODO (AC): Only search from the newly marked node?
        }
      }

      if ( !wasSenseAssigned ) {

        // Choose the circuit element with the smallest number of neighbors, ie favoring series elements
        requiresSenseAfterVisit.sort( ( a, b ) => {
          return this.getNeighborCircuitElementsForCircuitElement( a ).length - this.getNeighborCircuitElementsForCircuitElement( b ).length;
        } );

        const targetElement = requiresSenseAfterVisit[ 0 ];
        targetElement.currentSenseProperty.value = getSenseForPositive( targetElement.currentProperty.value );
        wasSenseAssigned = true;
      }
    }
  }

  // Assign the sense to an un-sensed circuit element based on matching the sign of a corresponding reference element.
  private static assignSense( targetElement: CircuitElement, referenceElement: CircuitElement ): void {
    assert && assert( targetElement.currentSenseProperty.value === CurrentSense.UNSPECIFIED, 'target should have an unspecified sense' );
    const targetElementCurrent = targetElement.currentProperty.value;
    const referenceElementCurrent = referenceElement.currentProperty.value;
    const referenceElementSense = referenceElement.currentSenseProperty.value;
    const desiredSign = referenceElementCurrent >= 0 && referenceElementSense === CurrentSense.FORWARD ? 'positive' :
                        referenceElementCurrent >= 0 && referenceElementSense === CurrentSense.BACKWARD ? 'negative' :
                        referenceElementCurrent < 0 && referenceElementSense === CurrentSense.FORWARD ? 'negative' :
                        referenceElementCurrent < 0 && referenceElementSense === CurrentSense.BACKWARD ? 'positive' :
                        'error';

    assert && assert( desiredSign !== 'error' );
    targetElement.currentSenseProperty.value = desiredSign === 'positive' ?
                                               getSenseForPositive( targetElementCurrent ) :
                                               getSenseForNegative( targetElementCurrent );
  }

  // Traverse the circuit, filling in senses to adjacent circuit elements during the traversal
  private propagateSenses(): void {

    const circuitElementsWithSenses = this.circuitElements.filter( c => c.currentSenseProperty.value !== CurrentSense.UNSPECIFIED );
    if ( circuitElementsWithSenses.length > 0 ) {

      // launch searches from circuit elements with known senses
      const toVisit: Vertex[] = [];
      circuitElementsWithSenses.forEach( c => {
        if ( !toVisit.includes( c.startVertexProperty.value ) ) { toVisit.push( c.startVertexProperty.value ); }
        if ( !toVisit.includes( c.endVertexProperty.value ) ) { toVisit.push( c.endVertexProperty.value ); }
      } );

      const visited: Vertex[] = [];
      while ( toVisit.length > 0 ) {
        const vertex = toVisit.pop()!;
        if ( !visited.includes( vertex ) ) {
          const neighborCircuitElements = this.getNeighborCircuitElements( vertex );
          for ( let i = 0; i < neighborCircuitElements.length; i++ ) {
            const circuitElement = neighborCircuitElements[ i ];
            const neighborVertex = circuitElement.getOppositeVertex( vertex );

            if ( circuitElement.currentSenseProperty.value === CurrentSense.UNSPECIFIED && circuitElement.currentProperty.value !== 0.0 ) {

              // choose sense from a neighbor. We discussed that we may need to be more selective in choosing the reference
              // neighbor, such as choosing the high voltage side's highest voltage neighbor.  However, we didn't see a
              // case where that was necessary yet.
              const specifiedNeighbors = neighborCircuitElements.filter( c => c !== circuitElement && c.currentSenseProperty.value !== CurrentSense.UNSPECIFIED );
              if ( specifiedNeighbors.length > 0 ) {
                Circuit.assignSense( circuitElement, specifiedNeighbors[ 0 ] );
              }
            }

            if ( !visited.includes( neighborVertex ) && !toVisit.includes( neighborVertex ) ) {
              toVisit.push( neighborVertex );
            }
          }
          visited.push( vertex );
        }
      }
    }
  }

  /**
   * Find the subgraph where all vertices are connected, given the list of traversible circuit elements.
   * There are a few other ad-hoc graph searches around, such as isInLoop and in LinearTransientAnalysis
   * @param vertex
   * @param okToVisit - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean, rule
   *                             - that determines which vertices are OK to visit
   */
  private searchVertices( vertex: Vertex, okToVisit: ( a: Vertex, c: CircuitElement, b: Vertex ) => boolean ): Vertex[] {

    const fixedVertices = [];
    const toVisit: Vertex[] = [ vertex ];
    const visited: Vertex[] = [];
    while ( toVisit.length > 0 ) {

      // Find the neighbors joined by a FixedCircuitElement, not a stretchy Wire
      const currentVertex = toVisit.pop()!;

      // If we haven't visited it before, then explore it
      if ( !visited.includes( currentVertex ) ) {

        const neighborCircuitElements = this.getNeighborCircuitElements( currentVertex );

        for ( let i = 0; i < neighborCircuitElements.length; i++ ) {
          const neighborCircuitElement = neighborCircuitElements[ i ];
          const neighborVertex = neighborCircuitElement.getOppositeVertex( currentVertex );

          // If the node was already visited, don't visit again
          if ( !visited.includes( neighborVertex ) &&
               !toVisit.includes( neighborVertex ) &&
               okToVisit( currentVertex, neighborCircuitElement, neighborVertex ) ) {
            toVisit.push( neighborVertex );
          }
        }
      }

      fixedVertices.push( currentVertex ); // Allow duplicates, will be _.uniq before return

      // O(n^2) to search for duplicates as we go, if this becomes a performance bottleneck we may wish to find a better
      // way to deduplicate, perhaps Set or something like that
      if ( !visited.includes( currentVertex ) ) {
        visited.push( currentVertex );
      }
    }
    return _.uniq( fixedVertices );
  }

  // Returns true if the circuit element is in a loop with a voltage source
  public isInLoop( circuitElement: CircuitElement ): boolean {

    // Special case for when we are asking if an open Switch is in a loop.  Open switches
    // cannot be in a loop since their vertices are not directly connected.  Note the search
    // algorithm below gives the wrong answer because the start vertex and end vertex can be connected
    // by other circuit elements.
    if ( circuitElement instanceof Switch && !circuitElement.isClosedProperty.value ) {
      return false;
    }

    // procedure DFS_iterative(G, v) is
    // let S be a stack
    // S.push(v)
    // while S is not empty do
    //   v = S.pop()
    //   if v is not labeled as discovered then
    //     label v as discovered
    //     for all edges from v to w in G.adjacentEdges(v) do
    //       S.push(w)

    // Iterative (not recursive) depth first search, so we can bail on a hit, see https://en.wikipedia.org/wiki/Depth-first_search
    const stack = [];
    const visited: Vertex[] = [];
    stack.push( circuitElement.startVertexProperty.value );
    while ( stack.length > 0 ) {
      const vertex = stack.pop()!;
      if ( !visited.includes( vertex ) ) {
        visited.push( vertex );

        for ( let i = 0; i < this.circuitElements.length; i++ ) {
          const neighbor = this.circuitElements[ i ];

          if ( neighbor.containsVertex( vertex ) &&

               // no shortcuts!
               neighbor !== circuitElement &&

               // can't cross an open switch
               !( neighbor instanceof Switch && !neighbor.isClosedProperty.value ) ) {
            const opposite = neighbor.getOppositeVertex( vertex );
            if ( opposite === circuitElement.endVertexProperty.value ) {

              // Hooray, we found a loop!
              return true;
            }
            stack.push( opposite );
          }
        }
      }
    }
    return false;
  }

  /**
   * Get the charges that are in the specified circuit element.
   */
  public getChargesInCircuitElement( circuitElement: CircuitElement ): Charge[] {
    return this.charges.filter( charge => charge.circuitElement === circuitElement );
  }

  /**
   * Find the subgraph where all vertices are connected by FixedCircuitElements, not stretchy wires.
   * @param vertex
   * @param [okToVisit] - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean,
   *                               - rule that determines which vertices are OK to visit
   */
  public findAllFixedVertices( vertex: Vertex, okToVisit: ( ( a: Vertex, c: CircuitElement, b: Vertex ) => boolean ) = e => true ): Vertex[] {
    return this.searchVertices( vertex, ( startVertex: Vertex, circuitElement: CircuitElement, endVertex: Vertex ) => {
      if ( okToVisit ) {
        return circuitElement instanceof FixedCircuitElement && okToVisit( startVertex, circuitElement, endVertex );
      }
      else {
        return circuitElement instanceof FixedCircuitElement;
      }
    } );
  }

  // Returns the selected Vertex or null if none is selected
  public getSelectedVertex(): Vertex | null {
    const selection = this.selectionProperty.value;
    if ( selection instanceof Vertex ) {
      return selection;
    }
    else {
      return null;
    }
  }

  /**
   * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
   * vertex.  Otherwise, return null.
   * @param vertex - the dragged vertex
   * @param mode - the application mode Circuit.InteractionMode.TEST | Circuit.InteractionMode.EXPLORE
   * @param blackBoxBounds - the bounds of the black box, if there is one
   * @returns - the vertex it will be able to connect to, if dropped or null if no connection is available
   */
  public getDropTarget( vertex: Vertex, mode: InteractionMode, blackBoxBounds: Bounds2 | null ): Vertex | null {

    if ( mode === InteractionMode.TEST ) {
      assert && assert( blackBoxBounds, 'bounds should be provided for build mode' );
    }

    // Rules for a vertex connecting to another vertex.
    let candidateVertices = this.vertexGroup.filter( candidateVertex => {

      // (1) A vertex may not connect to an adjacent vertex.
      if ( this.isVertexAdjacent( vertex, candidateVertex ) ) {
        return false;
      }

      // (2) A vertex cannot connect to itself
      if ( candidateVertex === vertex ) {
        return false;
      }

      // (2.5) cannot connect to something that is dragging
      if ( candidateVertex.isDragged ) {
        return false;
      }

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      if ( !( vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() ) < SNAP_RADIUS ) ) {
        return false;
      }

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      if ( !candidateVertex.attachableProperty.get() ) {
        return false;
      }

      // (5) Reject any matches that result in circuit elements sharing a pair of vertices, which would cause
      // the wires to lay across one another (one vertex was already shared)

      // if something else is already snapping to candidateVertex, then we cannot snap to it as well.
      // check the neighbor vertices
      for ( let i = 0; i < this.vertexGroup.count; i++ ) {
        const circuitVertex = this.vertexGroup.getElement( i );
        const adjacent = this.isVertexAdjacent( circuitVertex, vertex );

        // If the adjacent vertex has the same position as the candidate vertex, that means it is already "snapped"
        // there and hence another vertex should not snap there at the same time.
        if ( adjacent && circuitVertex.positionProperty.get().equals( candidateVertex.positionProperty.get() ) ) {
          return false;
        }
      }

      const fixedVertices = this.findAllFixedVertices( vertex );

      // (6) a vertex cannot be connected to its own fixed subgraph (no wire)
      for ( let i = 0; i < fixedVertices.length; i++ ) {
        if ( fixedVertices[ i ] === candidateVertex ) {
          return false;
        }
      }

      // (7) a wire vertex cannot connect if its neighbor is already proposing a connection
      // You can always attach to a black box interface
      if ( !candidateVertex.blackBoxInterfaceProperty.get() ) {
        const neighbors = this.getNeighborCircuitElements( candidateVertex );
        for ( let i = 0; i < neighbors.length; i++ ) {
          const neighbor = neighbors[ i ];
          const oppositeVertex = neighbor.getOppositeVertex( candidateVertex );

          // is another node proposing a match to that node?
          for ( let k = 0; k < this.vertexGroup.count; k++ ) {
            const v = this.vertexGroup.getElement( k );
            if ( neighbor instanceof Wire &&
                 v !== vertex &&
                 v !== oppositeVertex &&
                 v.positionProperty.get().equals( oppositeVertex.positionProperty.get() ) &&
                 v.isDragged
            ) {
              return false;
            }
          }
        }
      }

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      const candidateNeighbors = this.getNeighboringVertices( candidateVertex );
      const myNeighbors = this.getNeighboringVertices( vertex );
      const intersection = _.intersection( candidateNeighbors, myNeighbors );
      if ( intersection.length !== 0 ) {
        return false;
      }

      // All tests passed, it's OK for connection
      return true;
    } );

    // TODO (black-box-study): integrate rule (9) with the other rules above
    // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
    // a black box interface vertex if its other vertices would be outside of the black box.  See #136
    if ( mode === InteractionMode.TEST ) {
      const boxBounds = blackBoxBounds!;
      const fixedVertices2 = this.findAllFixedVertices( vertex );
      candidateVertices = candidateVertices.filter( candidateVertex => {

        // Don't connect to vertices that might have sneaked outside of the black box, say by a rotation.
        if ( !candidateVertex.blackBoxInterfaceProperty.get() && !boxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
          return false;
        }

        // How far the vertex would be moved if it joined to the candidate
        const delta = candidateVertex.positionProperty.get().minus( vertex.positionProperty.get() );

        if ( candidateVertex.blackBoxInterfaceProperty.get() || boxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
          for ( let i = 0; i < fixedVertices2.length; i++ ) {
            const connectedVertex = fixedVertices2[ i ];
            if ( connectedVertex.blackBoxInterfaceProperty.get() ) {

              // OK for black box interface vertex to be slightly outside the box
            }
            else if ( connectedVertex !== vertex && !boxBounds.containsPoint( connectedVertex.positionProperty.get().plus( delta ) ) &&

                      // exempt wires connected outside of the black box, which are flagged as un-attachable in build mode, see #141
                      connectedVertex.attachableProperty.get() ) {
              return false;
            }
          }
        }
        else {
          return true;
        }
        return true;
      } );

      // a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( candidateVertex => !candidateVertex.outerWireStub );
    }
    if ( candidateVertices.length === 0 ) { return null; }

    // Find the closest match
    const sorted = _.sortBy( candidateVertices, candidateVertex =>
      vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() )
    );
    return sorted[ 0 ];
  }

  // A reporting tool to indicate whether current is conserved at each vertex
  private checkCurrentConservation( index: number ): void {
    console.log( '####### ' + index );
    // the sum of currents flowing into the vertex should be 0
    this.vertexGroup.forEach( vertex => {
      const neighbors = this.getNeighborCircuitElements( vertex );
      let sum = 0;
      neighbors.forEach( neighbor => {
        const sign = neighbor.startVertexProperty.value === vertex ? +1 : -1;
        const current = sign * neighbor.currentProperty.value;
        sum += current;
      } );
      console.log( `${vertex.index}: ${sum}` );
    } );
  }

  /**
   * Due to numerical floating point errors, current may not be exactly conserved.  But we don't want to show electrons
   * moving in some part of a loop but not others, so we manually enforce current conservation at each vertex.
   */
  public conserveCurrent( vertex: Vertex, locked: CircuitElement[] ): void {
    // the sum of currents flowing into the vertex should be 0
    const neighbors = this.getNeighborCircuitElements( vertex );
    let sum = 0;
    neighbors.forEach( neighbor => {
      const sign = neighbor.startVertexProperty.value === vertex ? +1 : -1;
      const current = sign * neighbor.currentProperty.value;
      sum += current;
    } );

    // If the amount of unconserved current is too high, then try to adjust other currents to compensate
    if ( Math.abs( sum ) > 1E-10 ) {

      // divide the problem to all mutable (participant), non-locked neighbors
      const unlockedNeighbors = neighbors.filter( n => !locked.includes( n ) );
      const overflow = sum / unlockedNeighbors.length;
      unlockedNeighbors.forEach( neighbor => {
        const sign = neighbor.startVertexProperty.value === vertex ? +1 : -1;
        neighbor.currentProperty.value += -sign * overflow;
        locked.push( neighbor );
      } );
    }
  }

  /**
   * Flip the given CircuitElement
   * @param circuitElement - the circuit element to flip
   */
  public flip( circuitElement: CircuitElement ): void {
    const startVertex = circuitElement.startVertexProperty.value;
    const endVertex = circuitElement.endVertexProperty.value;
    circuitElement.startVertexProperty.value = endVertex;
    circuitElement.endVertexProperty.value = startVertex;

    const flipped = circuitElement.currentSenseProperty.value === CurrentSense.FORWARD ? CurrentSense.BACKWARD :
                    circuitElement.currentSenseProperty.value === CurrentSense.BACKWARD ? CurrentSense.FORWARD :
                    CurrentSense.UNSPECIFIED;
    circuitElement.currentSenseProperty.value = flipped;

    // Layout the charges in the circuitElement but nowhere else, since that creates a discontinuity in the motion
    circuitElement.chargeLayoutDirty = true;
    this.layoutChargesInDirtyCircuitElements();
    this.markDirty();
  }

  /**
   * Creates and positions charges in the specified circuit element.
   * @param circuitElement - the circuit element within which the charges will be updated
   */
  private layoutCharges( circuitElement: CircuitElement ): void {

    // Avoid unnecessary work to improve performance
    if ( circuitElement.chargeLayoutDirty ) {

      circuitElement.chargeLayoutDirty = false;

      // Identify charges that were already in the branch.
      const charges = this.getChargesInCircuitElement( circuitElement );

      // put charges 1/2 separation from the edge so it will match up with adjacent components
      const offset = CCKCConstants.CHARGE_SEPARATION / 2;
      const lastChargePosition = circuitElement.chargePathLength - offset;
      const firstChargePosition = offset;
      const lengthForCharges = lastChargePosition - firstChargePosition;

      // Utils.roundSymmetric leads to charges too far apart when N=2
      const numberOfCharges = Math.ceil( lengthForCharges / CCKCConstants.CHARGE_SEPARATION );

      // compute distance between adjacent charges
      const spacing = lengthForCharges / ( numberOfCharges - 1 );

      for ( let i = 0; i < numberOfCharges; i++ ) {

        // If there is a single particle, show it in the middle of the component, otherwise space equally
        const chargePosition = numberOfCharges === 1 ?
                               ( firstChargePosition + lastChargePosition ) / 2 :
                               i * spacing + offset;

        const desiredCharge = this.currentTypeProperty.get() === CurrentType.ELECTRONS ? -1 : +1;

        if ( charges.length > 0 &&
             charges[ 0 ].charge === desiredCharge &&
             charges[ 0 ].circuitElement === circuitElement &&
             charges[ 0 ].visibleProperty === this.showCurrentProperty ) {

          const c = charges.shift()!; // remove 1st element, since it's the charge we checked in the guard
          c.circuitElement = circuitElement;
          c.distance = chargePosition;
          c.updatePositionAndAngle();
        }
        else {

          // nothing suitable in the pool, create something new
          const charge = new Charge( circuitElement, chargePosition, this.showCurrentProperty, desiredCharge );
          this.charges.add( charge );
        }
      }

      // Any charges that did not get recycled should be removed
      this.charges.removeAll( charges );
    }
  }

  // only works in unbuilt mode
  public override toString(): string {
    return this.circuitElements.map( c => c.constructor.name ).join( ', ' );
  }

  /**
   * Reset the Circuit to its initial state.
   */
  public reset(): void {
    this.clear();
    this.showCurrentProperty.reset();
    this.currentTypeProperty.reset();
    this.wireResistivityProperty.reset();
    this.sourceResistanceProperty.reset();
    this.chargeAnimator.reset();
    this.selectionProperty.reset();
  }
}

const CircuitStateIO = new IOType( 'CircuitStateIO', {
  valueType: Circuit,
  methods: {
    getValue: {
      returnType: ObjectLiteralIO,
      parameterTypes: [],
      implementation: function( this: Circuit ) {
        return phet.phetio.phetioEngine.phetioStateEngine.getState( this );
      },
      documentation: 'Gets the current value of the circuit on this screen.'
    },
    getValidationError: {
      returnType: NullableIO( StringIO ),
      parameterTypes: [ ObjectLiteralIO ],
      implementation: function( this: Circuit, value ) {

        // check if the specified circuit corresponds to this.tandemID. To avoid pasting a circuit from screen1 into screen2
        const keys = Array.from( Object.keys( value ) );

        for ( let i = 0; i < keys.length; i++ ) {
          const key = keys[ i ];
          if ( !key.startsWith( this.phetioID ) ) {
            return 'key had incorrect prefix. Expected: ' + this.phetioID + ' but got: ' + key;
          }
        }
        return null;
      },
      documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
    },

    setValue: {
      returnType: VoidIO,
      parameterTypes: [ ObjectLiteralIO ],
      documentation: 'Sets the circuit that was created on this screen. Trying to set a circuit from another screen results in an error.',
      implementation: function( this: Circuit, state: PhetioState ) {
        phet.phetio.phetioEngine.phetioStateEngine.setState( state, this.tandem );
      }
    }
  }
} );

circuitConstructionKitCommon.register( 'Circuit', Circuit );