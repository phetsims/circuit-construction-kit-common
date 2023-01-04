// Copyright 2016-2023, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { HBox, Node, NodeOptions, Text } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import Circuit from '../model/Circuit.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import ResistorType from '../model/ResistorType.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Switch from '../model/Switch.js';
import Wire from '../model/Wire.js';
import CircuitElementNumberControl from './CircuitElementNumberControl.js';
import ClearDynamicsButton from './ClearDynamicsButton.js';
import PhaseShiftControl from './PhaseShiftControl.js';
import RepairFuseButton from './RepairFuseButton.js';
import ReverseBatteryButton from './ReverseBatteryButton.js';
import SwitchReadoutNode from './SwitchReadoutNode.js';
import CCKCTrashButton from './CCKCTrashButton.js';
import CircuitElement from '../model/CircuitElement.js';
import InteractionMode from '../model/InteractionMode.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

const capacitanceStringProperty = CircuitConstructionKitCommonStrings.capacitanceStringProperty;
const capacitanceUnitsStringProperty = CircuitConstructionKitCommonStrings.capacitanceUnitsStringProperty;
const currentRatingStringProperty = CircuitConstructionKitCommonStrings.currentRatingStringProperty;
const currentUnitsStringProperty = CircuitConstructionKitCommonStrings.currentUnitsStringProperty;
const frequencyHzValuePatternStringProperty = CircuitConstructionKitCommonStrings.frequencyHzValuePatternStringProperty;
const frequencyStringProperty = CircuitConstructionKitCommonStrings.frequencyStringProperty;
const inductanceStringProperty = CircuitConstructionKitCommonStrings.inductanceStringProperty;
const inductanceUnitsStringProperty = CircuitConstructionKitCommonStrings.inductanceUnitsStringProperty;
const resistanceOhmsValuePatternStringProperty = CircuitConstructionKitCommonStrings.resistanceOhmsValuePatternStringProperty;
const resistanceStringProperty = CircuitConstructionKitCommonStrings.resistanceStringProperty;
const tapCircuitElementToEditStringProperty = CircuitConstructionKitCommonStrings.tapCircuitElementToEditStringProperty;
const voltageStringProperty = CircuitConstructionKitCommonStrings.voltageStringProperty;
const voltageVoltsValuePatternStringProperty = CircuitConstructionKitCommonStrings.voltageVoltsValuePatternStringProperty;

// constants
const GET_LAYOUT_POSITION = ( visibleBounds: Bounds2, centerX: number ) => {
  return {
    centerX: centerX,
    bottom: visibleBounds.bottom - CCKCConstants.HORIZONTAL_MARGIN
  };
};

// So we can pass classes as types for instanceof checks, I've been using https://www.typescriptlang.org/docs/handbook/mixins.html
// as a reference for how to create this type
type GConstructor<T = EmptySelfOptions> = new ( ...args: IntentionalAny[] ) => T;

const NORMAL_SLIDER_KNOB_DELTA = 1;
const HIGH_SLIDER_KNOB_DELTA = 100;
const NORMAL_TWEAKER_DELTA = 0.1;
const HIGH_TWEAKER_DELTA = 10;

// a singleton adapter property allows for the same EditContainerNode to be repurposed for different circuit components of the same type
// this is because we want to have a single control for editing any component of that type
const createSingletonAdapterProperty = <T extends CircuitElement>(
  initialValue: number,
  CircuitElementType: GConstructor<T>,
  circuit: Circuit,
  getter: ( circuitElement: T ) => Property<number>,
  predicate: ( element: T ) => boolean = () => true ) => {

  // Cannot use DynamicProperty.derivedProperty since the selected circuit element isn't always the right subtype of CircuitElement
  const singletonAdapterProperty = new Property( initialValue, {} );
  singletonAdapterProperty.link( value => {
    if ( circuit.selectionProperty.value && circuit.selectionProperty.value instanceof CircuitElementType ) {
      getter( circuit.selectionProperty.value ).value = value;
    }
  } );

  // When the value in the model changes, say from PhET-iO, we propagate it back to the control
  const modelListener = ( currentRating: number ) => singletonAdapterProperty.set( currentRating );
  circuit.selectionProperty.link( ( newCircuitElement, oldCircuitElement ) => {
    oldCircuitElement instanceof CircuitElementType && predicate( oldCircuitElement ) && getter( oldCircuitElement ).unlink( modelListener );
    newCircuitElement instanceof CircuitElementType && predicate( newCircuitElement ) && getter( newCircuitElement ).link( modelListener );
  } );
  return singletonAdapterProperty;
};

type SelfOptions = {
  showPhaseShiftControl?: boolean;
};
type CircuitElementEditContainerNodeOptions = SelfOptions & NodeOptions;

export default class CircuitElementEditContainerNode extends Node {

  public constructor( circuit: Circuit, visibleBoundsProperty: Property<Bounds2>, modeProperty: EnumerationProperty<InteractionMode>, playAreaCenterXProperty: Property<number>, tandem: Tandem,
                      providedOptions?: CircuitElementEditContainerNodeOptions ) {

    super();

    const options = optionize<CircuitElementEditContainerNodeOptions, SelfOptions, NodeOptions>()( {
      showPhaseShiftControl: false
    }, providedOptions );

    // Create reusable components that will get assembled into a panel for the selected circuit element
    const trashButton = new CCKCTrashButton( circuit, tandem.createTandem( 'trashButton' ) );
    const trashButtonContainer = new HBox( { children: [ trashButton ] } ); // Use the "nested node" pattern for gated visibilty

    const repairFuseButton = new RepairFuseButton( circuit, {
      tandem: tandem.createTandem( 'repairFuseButton' ),

      // NOTE: This only works if the trash button was originally smaller
      maxHeight: trashButton.height
    } );

    const clearDynamicsButton = new ClearDynamicsButton( circuit, {
      tandem: circuit.includeACElements ? tandem.createTandem( 'clearButton' ) : Tandem.OPT_OUT,
      // NOTE: This only works if the trash button was originally smaller
      maxHeight: trashButton.height
    } );

    const reverseBatteryButton = new ReverseBatteryButton( circuit, {
      tandem: tandem.createTandem( 'reverseBatteryButton' ),

      // NOTE: This only works if the trash button was originally smaller
      maxHeight: trashButton.height
    } );

    const switchReadoutNode = new SwitchReadoutNode( circuit, tandem.createTandem( 'switchReadoutNode' ), trashButtonContainer );

    const listener = ( isDisposable: boolean ) => trashButtonContainer.setVisible( isDisposable );

    // Connect the listener dynamically to the selected circuit element
    circuit.selectionProperty.link( ( newCircuitElement, oldCircuitElement ) => {
      newCircuitElement instanceof CircuitElement && newCircuitElement.isDisposableProperty.link( listener );
      oldCircuitElement instanceof CircuitElement && oldCircuitElement.isDisposableProperty.unlink( listener );
    } );

    // For PhET-iO, NumberControls are created statically on startup and switch between which CircuitElement it controls.
    const fuseCurrentRatingControl = new CircuitElementNumberControl( currentRatingStringProperty,

      // Adapter to take from {{named}} to {{value}} for usage in common code
      StringUtils.fillIn( currentUnitsStringProperty, { current: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Fuse.DEFAULT_CURRENT_RATING, Fuse, circuit, ( c: Fuse ) => c.currentRatingProperty ),
      Fuse.RANGE, circuit,
      1, {
        tandem: tandem.createTandem( 'currentRatingControl' ),
        delta: NORMAL_TWEAKER_DELTA, // For the tweakers
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, 0.5 )
        }
      } );

    const capacitorEditControl = new CircuitElementNumberControl( capacitanceStringProperty,
      StringUtils.fillIn( capacitanceUnitsStringProperty, { capacitance: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Capacitor.CAPACITANCE_DEFAULT, Capacitor, circuit, ( c: Capacitor ) => c.capacitanceProperty ),
      Capacitor.CAPACITANCE_RANGE, circuit, Capacitor.NUMBER_OF_DECIMAL_PLACES, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'capacitanceNumberControl' ) : Tandem.OPT_OUT,
        delta: CCKCQueryParameters.capacitanceStep,
        // For dragging the slider knob
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, CCKCQueryParameters.capacitanceStep )
        }
      } );

    const inductanceControl = new CircuitElementNumberControl( inductanceStringProperty,
      StringUtils.fillIn( inductanceUnitsStringProperty, { inductance: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Inductor.INDUCTANCE_DEFAULT, Inductor, circuit, ( c: Inductor ) => c.inductanceProperty ),
      Inductor.INDUCTANCE_RANGE, circuit, Inductor.INDUCTANCE_NUMBER_OF_DECIMAL_PLACES, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'inductanceNumberControl' ) : Tandem.OPT_OUT,
        delta: CCKCQueryParameters.inductanceStep,

        // For dragging the slider knob
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, 0.1 )
        }
      } );

    type GConstructor<T> = new ( ...args: IntentionalAny[] ) => T;

    const createResistanceNumberControl = ( tandemName: string, CircuitElementType: GConstructor<LightBulb | Resistor> ) => new CircuitElementNumberControl( resistanceStringProperty,
      StringUtils.fillIn( resistanceOhmsValuePatternStringProperty, { resistance: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( ResistorType.RESISTOR.defaultResistance, CircuitElementType, circuit, ( c: LightBulb | Resistor ) => c.resistanceProperty,
        ( c: LightBulb | Resistor ) =>
          ( c instanceof LightBulb && !c.highResistance ) ||
          ( c instanceof Resistor && c.resistorType !== ResistorType.HIGH_RESISTANCE_RESISTOR )
      ),
      ResistorType.RESISTOR.range, circuit, Resistor.RESISTANCE_DECIMAL_PLACES, {
        tandem: tandem.createTandem( tandemName ),
        delta: NORMAL_TWEAKER_DELTA,
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, NORMAL_SLIDER_KNOB_DELTA ) // For dragging the slider knob
        },
        numberDisplayOptions: { decimalPlaces: Resistor.RESISTANCE_DECIMAL_PLACES }
      } );
    const createHighResistanceNumberControl = ( tandemName: string, CircuitElementType: GConstructor<LightBulb | Resistor> ) => new CircuitElementNumberControl( resistanceStringProperty,
      StringUtils.fillIn( resistanceOhmsValuePatternStringProperty, { resistance: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( ResistorType.HIGH_RESISTANCE_RESISTOR.defaultResistance, CircuitElementType, circuit, ( c: LightBulb | Resistor ) => c.resistanceProperty,
        ( c: LightBulb | Resistor ) =>
          ( c instanceof LightBulb && c.highResistance ) ||
          ( c instanceof Resistor && c.resistorType === ResistorType.HIGH_RESISTANCE_RESISTOR )
      ),
      ResistorType.HIGH_RESISTANCE_RESISTOR.range, circuit, Resistor.HIGH_RESISTANCE_DECIMAL_PLACES, {
        tandem: circuit.includeLabElements ? tandem.createTandem( tandemName ) : Tandem.OPT_OUT,
        delta: HIGH_TWEAKER_DELTA,
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, HIGH_SLIDER_KNOB_DELTA ) // For dragging the slider knob
        },
        numberDisplayOptions: { decimalPlaces: Resistor.HIGH_RESISTANCE_DECIMAL_PLACES }
      } );

    const resistanceNumberControl = createResistanceNumberControl( 'resistanceNumberControl', Resistor );
    const lightBulbResistanceNumberControl = createResistanceNumberControl( 'lightBulbResistanceNumberControl', LightBulb );
    const highResistanceNumberControl = createHighResistanceNumberControl( 'highResistanceNumberControl', Resistor );
    const lightBulbHighResistanceNumberControl = createHighResistanceNumberControl( 'lightBulbHighResistanceNumberControl', LightBulb );

    const voltageNumberControl = new CircuitElementNumberControl( voltageStringProperty,
      StringUtils.fillIn( voltageVoltsValuePatternStringProperty, { voltage: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Battery.VOLTAGE_DEFAULT, Battery, circuit, ( c: Battery ) => c.voltageProperty, ( c: Battery ) => c.batteryType === 'normal' ),
      Battery.VOLTAGE_RANGE,
      circuit,
      Battery.VOLTAGE_DECIMAL_PLACES, {
        tandem: tandem.createTandem( 'voltageNumberControl' ),
        delta: NORMAL_TWEAKER_DELTA,
        sliderOptions: { // For dragging the slider knob
          constrainValue: ( value: number ) => Utils.roundToInterval( value, NORMAL_SLIDER_KNOB_DELTA )
        },
        numberDisplayOptions: { decimalPlaces: Battery.VOLTAGE_DECIMAL_PLACES }
      } );
    const highVoltageNumberControl = new CircuitElementNumberControl( voltageStringProperty,
      StringUtils.fillIn( voltageVoltsValuePatternStringProperty, { voltage: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Battery.HIGH_VOLTAGE_DEFAULT, Battery, circuit, ( c: Battery ) => c.voltageProperty, ( c: Battery ) => c.batteryType === 'high-voltage' ),
      Battery.HIGH_VOLTAGE_RANGE,
      circuit,
      Battery.HIGH_VOLTAGE_DECIMAL_PLACES, {
        tandem: circuit.includeLabElements ? tandem.createTandem( 'highVoltageNumberControl' ) : Tandem.OPT_OUT,
        delta: HIGH_TWEAKER_DELTA,
        sliderOptions: { // For dragging the slider knob
          constrainValue: ( value: number ) => Utils.roundToInterval( value, HIGH_SLIDER_KNOB_DELTA )
        },
        numberDisplayOptions: { decimalPlaces: Battery.HIGH_VOLTAGE_DECIMAL_PLACES }
      } );

    const phaseShiftControl = new PhaseShiftControl( createSingletonAdapterProperty( 0, ACVoltage, circuit, ( c: ACVoltage ) => c.phaseProperty ), circuit, {
      tandem: circuit.includeACElements ? tandem.createTandem( 'phaseShiftControl' ) : Tandem.OPT_OUT
    } );

    const acVoltageControl = new CircuitElementNumberControl(
      voltageStringProperty,
      StringUtils.fillIn( voltageVoltsValuePatternStringProperty, {
        voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
      } ),
      createSingletonAdapterProperty( 9, ACVoltage, circuit, circuitElement => circuitElement.maximumVoltageProperty ),
      ACVoltage.MAX_VOLTAGE_RANGE,
      circuit,
      2, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'acVoltageControl' ) : Tandem.OPT_OUT,
        getAdditionalVisibilityProperties: ( c: CircuitElement ) => {
          return c instanceof ACVoltage ? [ c.isVoltageEditableProperty ] : [];
        }
      }
    );

    const acFrequencyControl = new CircuitElementNumberControl(
      frequencyStringProperty,
      StringUtils.fillIn( frequencyHzValuePatternStringProperty, {
        frequency: SunConstants.VALUE_NAMED_PLACEHOLDER
      } ),
      createSingletonAdapterProperty( ACVoltage.DEFAULT_FREQUENCY, ACVoltage, circuit, circuitElement => circuitElement.frequencyProperty ),
      ACVoltage.FREQUENCY_RANGE,
      circuit,
      2, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'frequencyControl' ) : Tandem.OPT_OUT,
        delta: 0.01,
        getAdditionalVisibilityProperties: ( c: CircuitElement ) => {
          return c instanceof ACVoltage ? [ c.isFrequencyEditableProperty ] : [];
        }
      }
    );

    const tapInstructionText = new Text( tapCircuitElementToEditStringProperty, {
      fontSize: 24,
      maxWidth: 300,
      tandem: tandem.createTandem( 'tapInstructionText' ),
      visiblePropertyOptions: {

        // Visibility is controlled by the link below
        phetioReadOnly: true
      }
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    const updateInstructionTextVisible = () => {

      // Only fixed length circuit elements are editable, even though wires can be deleted
      const fixedLengthElements = circuit.circuitElements.filter( circuitElement =>
        circuitElement instanceof FixedCircuitElement && circuitElement.interactiveProperty.get()
      );
      tapInstructionText.visible = fixedLengthElements.length > 0;
    };

    circuit.vertexDroppedEmitter.addListener( updateInstructionTextVisible );

    // Also update on reset all, or if a component is dropped in the toolbox
    circuit.vertexGroup.elementDisposedEmitter.addListener( updateInstructionTextVisible );
    modeProperty.link( updateInstructionTextVisible );

    const updatePosition = () => {

      // Layout, but only if we have something to display (otherwise bounds fail out)
      this.bounds.isValid() && this.mutate( GET_LAYOUT_POSITION( visibleBoundsProperty.get(), playAreaCenterXProperty.value ) );
    };

    // When the selected element changes, update the displayed controls
    let editNode: Node | null = null;
    circuit.selectionProperty.link( selectedCircuitElement => {
      if ( editNode ) {
        this.hasChild( editNode ) && this.removeChild( editNode );
        if ( editNode !== tapInstructionText && editNode !== trashButtonContainer && editNode !== switchReadoutNode ) {
          editNode.dispose();
        }
      }

      editNode = null;

      if ( selectedCircuitElement ) {

        if ( selectedCircuitElement instanceof Resistor && selectedCircuitElement.isResistanceEditable() ) {
          const isHighResistance = selectedCircuitElement.resistorType === ResistorType.HIGH_RESISTANCE_RESISTOR;
          editNode = new EditPanel( [
            isHighResistance ? highResistanceNumberControl : resistanceNumberControl,
            trashButtonContainer
          ] );
        }

        // Real bulb has no resistance control
        else if ( selectedCircuitElement instanceof LightBulb && !selectedCircuitElement.real ) {
          editNode = new EditPanel( [
              selectedCircuitElement.highResistance ? lightBulbHighResistanceNumberControl : lightBulbResistanceNumberControl,
              trashButtonContainer
            ]
          );
        }
        else if ( selectedCircuitElement instanceof Resistor || ( selectedCircuitElement instanceof LightBulb && selectedCircuitElement.real ) ) {

          // Just show a trash button for non-editable resistors which are household items and for real bulbs
          editNode = trashButtonContainer;
        }
        else if ( selectedCircuitElement instanceof Battery ) {
          editNode = new EditPanel( [
              reverseBatteryButton, // Batteries can be reversed
              selectedCircuitElement.batteryType === 'high-voltage' ? highVoltageNumberControl : voltageNumberControl,
              trashButtonContainer
            ]
          );
        }
        else if ( selectedCircuitElement instanceof Fuse ) {
          editNode = new EditPanel( [
              repairFuseButton,
              fuseCurrentRatingControl,
              trashButtonContainer
            ]
          );
        }
        else if ( selectedCircuitElement instanceof Switch ) {

          editNode = switchReadoutNode;

          // The trashButton is shared between different components, so we must trigger a relayout to get the relative
          // position correct before displaying.
          switchReadoutNode.updateLayout();
        }
        else if ( selectedCircuitElement instanceof SeriesAmmeter || selectedCircuitElement instanceof Wire ) {

          // Just show a trash button
          editNode = trashButtonContainer;
        }
        else if ( selectedCircuitElement instanceof ACVoltage ) {
          const children: Node[] = [
            acVoltageControl,
            acFrequencyControl
          ];

          if ( options.showPhaseShiftControl ) {
            children.push( phaseShiftControl );
          }
          children.push( trashButtonContainer );
          editNode = new EditPanel( children );
        }
        else if ( selectedCircuitElement instanceof Capacitor ) {
          editNode = new EditPanel( [
            clearDynamicsButton,
            capacitorEditControl,
            trashButtonContainer
          ] );
        }
        else if ( selectedCircuitElement instanceof Inductor ) {
          editNode = new EditPanel( [
              clearDynamicsButton,
              inductanceControl,
              trashButtonContainer
            ]
          );
        }
      }
      else {
        editNode = tapInstructionText;
      }
      if ( editNode !== null ) {
        this.addChild( editNode );

        if ( editNode === tapInstructionText || editNode instanceof SwitchReadoutNode ) {
          this.mouseArea = null;
          this.touchArea = null;
        }
        else {

          // Clicking nearby (but not directly on) a tweaker button or slider shouldn't dismiss the edit panel,
          // see https://github.com/phetsims/circuit-construction-kit-dc/issues/90
          this.mouseArea = this.localBounds.dilatedXY( 20, CCKCConstants.VERTICAL_MARGIN );
          this.touchArea = this.localBounds.dilatedXY( 20, CCKCConstants.VERTICAL_MARGIN );
        }
      }
      updatePosition();
    } );

    visibleBoundsProperty.link( updatePosition );
  }
}

/**
 * HBox with standardized options
 */
class EditHBox extends HBox {
  public constructor( children: Node[] ) {
    super( {
      spacing: 25,
      align: 'bottom',
      children: children
    } );
  }
}

/**
 * Panel to facilitate in visual layout of the controls.
 */
class EditPanel extends Panel {
  private readonly hbox: EditHBox;

  public constructor( children: Node[] ) {
    const hbox = new EditHBox( children );
    super( hbox, {
      fill: '#caddfa',
      stroke: null,
      xMargin: 10,
      yMargin: 10,
      cornerRadius: 10
    } );
    this.hbox = hbox;
  }

  public override dispose(): void {
    this.hbox.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );