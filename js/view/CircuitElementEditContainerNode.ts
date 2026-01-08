// Copyright 2016-2026, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import Property from '../../../axon/js/Property.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import { roundToInterval } from '../../../dot/js/util/roundToInterval.js';
import { toFixed } from '../../../dot/js/util/toFixed.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import AccessibleInteractiveOptions from '../../../scenery-phet/js/accessibility/AccessibleInteractiveOptions.js';
import ParallelDOM from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Panel from '../../../sun/js/Panel.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import isSettingPhetioStateProperty from '../../../tandem/js/isSettingPhetioStateProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CircuitDescriptionUtils from '../CircuitDescriptionUtils.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import type Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import type InteractionMode from '../model/InteractionMode.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import ResistorType from '../model/ResistorType.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Switch from '../model/Switch.js';
import type Vertex from '../model/Vertex.js';
import Wire from '../model/Wire.js';
import BatteryReverseButton from './BatteryReverseButton.js';
import CCKCColors from './CCKCColors.js';
import CCKCDisconnectButton from './CCKCDisconnectButton.js';
import CCKCTrashButton from './CCKCTrashButton.js';
import CircuitElementNumberControl from './CircuitElementNumberControl.js';
import CircuitNode from './CircuitNode.js';
import ClearDynamicsButton from './ClearDynamicsButton.js';
import FuseRepairButton from './FuseRepairButton.js';
import PhaseShiftControl from './PhaseShiftControl.js';
import SwitchReadoutNode from './SwitchReadoutNode.js';
import SwitchToggleButton from './SwitchToggleButton.js';
import CircuitContextResponses from './description/CircuitContextResponses.js';

const capacitanceStringProperty = CircuitConstructionKitCommonFluent.capacitanceStringProperty;
const capacitanceUnitsStringProperty = CircuitConstructionKitCommonFluent.capacitanceUnitsStringProperty;
const currentRatingStringProperty = CircuitConstructionKitCommonFluent.currentRatingStringProperty;
const currentUnitsStringProperty = CircuitConstructionKitCommonFluent.currentUnitsStringProperty;
const frequencyHzValuePatternStringProperty = CircuitConstructionKitCommonFluent.frequencyHzValuePatternStringProperty;
const frequencyStringProperty = CircuitConstructionKitCommonFluent.frequencyStringProperty;
const inductanceStringProperty = CircuitConstructionKitCommonFluent.inductanceStringProperty;
const inductanceUnitsStringProperty = CircuitConstructionKitCommonFluent.inductanceUnitsStringProperty;
const resistanceOhmsValuePatternStringProperty = CircuitConstructionKitCommonFluent.resistanceOhmsValuePatternStringProperty;
const resistanceStringProperty = CircuitConstructionKitCommonFluent.resistanceStringProperty;
const tapCircuitElementToEditStringProperty = CircuitConstructionKitCommonFluent.tapCircuitElementToEditStringProperty;
const voltageStringProperty = CircuitConstructionKitCommonFluent.voltageStringProperty;
const voltageVoltsValuePatternStringProperty = CircuitConstructionKitCommonFluent.voltageVoltsValuePatternStringProperty;

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

// a singleton adapter property allows for the same EditContainerNode to be repurposed for different circuit components of the same type
// this is because we want to have a single control for editing any component of that type
const createSingletonAdapterProperty = <T extends CircuitElement, ValueType>(
  initialValue: ValueType,
  CircuitElementType: GConstructor<T>,
  circuit: Circuit,
  getter: ( circuitElement: T ) => Property<ValueType>,
  predicate: ( element: T ) => boolean = () => true ) => {

  // Cannot use DynamicProperty.derivedProperty since the selected circuit element isn't always the right subtype of CircuitElement
  const singletonAdapterProperty = new Property<ValueType>( initialValue, {} );
  singletonAdapterProperty.link( value => {
    if ( circuit.selectionProperty.value && circuit.selectionProperty.value instanceof CircuitElementType ) {
      getter( circuit.selectionProperty.value ).value = value;
    }
  } );

  // When the value in the model changes, say from PhET-iO, we propagate it back to the control
  const modelListener = ( value: ValueType ) => singletonAdapterProperty.set( value );
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

  public constructor( circuitNode: CircuitNode, visibleBoundsProperty: Property<Bounds2>, modeProperty: EnumerationProperty<InteractionMode>, playAreaCenterXProperty: Property<number>, tandem: Tandem,
                      providedOptions?: CircuitElementEditContainerNodeOptions ) {

    const circuit = circuitNode.circuit;
    const circuitContextResponses = new CircuitContextResponses( circuit );

    super( AccessibleInteractiveOptions );

    this.focusable = false;

    const options = optionize<CircuitElementEditContainerNodeOptions, SelfOptions, NodeOptions>()( {
      showPhaseShiftControl: false
    }, providedOptions );

    // Create reusable components that will get assembled into a panel for the selected circuit element
    const trashButton = new CCKCTrashButton( circuitNode, tandem.createTandem( 'trashButton' ) );

    // Use the "nested node" pattern for gated visibility
    const trashButtonContainer = new Node( {

      // Ensure panel bounds reflow when the child is made invisible via phet-io
      excludeInvisibleChildrenFromBounds: true,
      children: [ trashButton ]
    } );

    const disconnectButton = new CCKCDisconnectButton( circuit, tandem.createTandem( 'disconnectButton' ) );

    const disconnectButtonContainer = new Node( {
      excludeInvisibleChildrenFromBounds: true,
      children: [ disconnectButton ]
    } );

    const fuseRepairButton = new FuseRepairButton( circuit, {
      tandem: tandem.createTandem( 'fuseRepairButton' ),

      // NOTE: This only works if the trash button was originally smaller
      maxHeight: trashButton.height
    } );

    const fuseRepairButtonContainer = new Node( {
      excludeInvisibleChildrenFromBounds: true,
      children: [ fuseRepairButton ]
    } );

    const isRepairableListener = ( isRepairable: boolean ) => fuseRepairButtonContainer.setVisible( isRepairable );

    // This is reused across all instances.  The button itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof Fuse && oldCircuitElement.isRepairableProperty.unlink( isRepairableListener );
      newCircuitElement instanceof Fuse && newCircuitElement.isRepairableProperty.link( isRepairableListener );
    } );

    const clearDynamicsButton = new ClearDynamicsButton( circuit, {
      tandem: circuit.includeACElements ? tandem.createTandem( 'clearButton' ) : Tandem.OPT_OUT,
      // NOTE: This only works if the trash button was originally smaller
      maxHeight: trashButton.height
    } );

    const batteryReverseButton = new BatteryReverseButton( circuit, {
      tandem: tandem.createTandem( 'batteryReverseButton' ),

      // NOTE: This only works if the trash button was originally smaller
      maxHeight: trashButton.height
    } );

    // This is reused across all batteries.  The button itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    const batteryReverseContainerNode = new Node( {
      excludeInvisibleChildrenFromBounds: true,
      children: [ batteryReverseButton ]
    } );

    const isReversibleListener = ( isReversible: boolean ) => batteryReverseContainerNode.setVisible( isReversible );

    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof Battery && oldCircuitElement.isReversibleProperty.unlink( isReversibleListener );
      newCircuitElement instanceof Battery && newCircuitElement.isReversibleProperty.link( isReversibleListener );
    } );

    const switchReadoutNode = new SwitchReadoutNode( circuit, tandem.createTandem( 'switchReadoutNode' ) );
    const switchToggleButton = new SwitchToggleButton( circuit, {
      tandem: tandem.createTandem( 'switchToggleButton' ),
      maxWidth: trashButton.width
    } );

    const listener = ( isDisposable: boolean ) => trashButtonContainer.setVisible( isDisposable );

    // Connect the listener dynamically to the selected circuit element
    circuit.selectionProperty.link( ( newCircuitElement, oldCircuitElement ) => {
      newCircuitElement instanceof CircuitElement && newCircuitElement.isDisposableProperty.link( listener );
      oldCircuitElement instanceof CircuitElement && oldCircuitElement.isDisposableProperty.unlink( listener );
    } );

    // For PhET-iO, NumberControls are created statically on startup and switch between which CircuitElement it controls.
    const fuseCurrentRatingControl = new CircuitElementNumberControl( currentRatingStringProperty,

      // Adapter to take from {{named}} to {{value}} for usage in common code
      new PatternStringProperty( currentUnitsStringProperty, { current: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Fuse.DEFAULT_CURRENT_RATING, Fuse, circuit, fuse => fuse.currentRatingProperty ),
      Fuse.RANGE, circuit,
      1, {
        tandem: tandem.createTandem( 'fuseCurrentRatingControl' ),
        delta: CCKCConstants.SLIDER_STEPS.fuseCurrentRatingControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.fuseCurrentRatingControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.fuseCurrentRatingControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.fuseCurrentRatingControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.fuseCurrentRatingControl.shiftKeyboardStep ),
          createAriaValueText: ( value: number ) =>
            CircuitConstructionKitCommonFluent.a11y.fuseCurrentRatingControl.ariaValueText.format( {
              currentNumber: value,
              currentFormatted: toFixed( value, 1 )
            } )
        }
      } );

    const capacitorEditControl = new CircuitElementNumberControl( capacitanceStringProperty,
      new PatternStringProperty( capacitanceUnitsStringProperty, { capacitance: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Capacitor.CAPACITANCE_DEFAULT, Capacitor, circuit, capacitor => capacitor.capacitanceProperty ),
      Capacitor.CAPACITANCE_RANGE, circuit, Capacitor.NUMBER_OF_DECIMAL_PLACES, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'capacitanceNumberControl' ) : Tandem.OPT_OUT,
        delta: CCKCConstants.SLIDER_STEPS.capacitanceNumberControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.capacitanceNumberControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.capacitanceNumberControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.capacitanceNumberControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.capacitanceNumberControl.shiftKeyboardStep )
        }
      } );

    const inductanceControl = new CircuitElementNumberControl( inductanceStringProperty,
      new PatternStringProperty( inductanceUnitsStringProperty, { inductance: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( Inductor.INDUCTANCE_DEFAULT, Inductor, circuit, inductor => inductor.inductanceProperty ),
      Inductor.INDUCTANCE_RANGE, circuit, Inductor.INDUCTANCE_NUMBER_OF_DECIMAL_PLACES, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'inductanceNumberControl' ) : Tandem.OPT_OUT,
        delta: CCKCConstants.SLIDER_STEPS.inductanceNumberControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.inductanceNumberControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.inductanceNumberControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.inductanceNumberControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.inductanceNumberControl.shiftKeyboardStep )
        }
      } );

    type GConstructor<T> = new ( ...args: IntentionalAny[] ) => T;

    const resistanceOhmsValueStringProperty = new PatternStringProperty( resistanceOhmsValuePatternStringProperty, { resistance: SunConstants.VALUE_NAMED_PLACEHOLDER } );

    const createResistanceNumberControl = ( tandemName: 'resistorResistanceNumberControl' | 'lightBulbResistanceNumberControl', CircuitElementType: GConstructor<LightBulb | Resistor> ) => {
      return new CircuitElementNumberControl( resistanceStringProperty,
        resistanceOhmsValueStringProperty,
        createSingletonAdapterProperty( ResistorType.RESISTOR.defaultResistance, CircuitElementType, circuit, circuitElement => circuitElement.resistanceProperty,
          circuitElement =>
            ( circuitElement instanceof LightBulb && !circuitElement.isExtreme ) ||
            ( circuitElement instanceof Resistor && circuitElement.resistorType !== ResistorType.EXTREME_RESISTOR )
        ),
        ResistorType.RESISTOR.range, circuit, Resistor.RESISTANCE_DECIMAL_PLACES, {
          tandem: tandem.createTandem( tandemName ),
          delta: CCKCConstants.SLIDER_STEPS.resistorAndLightBulbResistanceNumberControl.shiftKeyboardStep,
          pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.resistorAndLightBulbResistanceNumberControl.pointerRoundingInterval,
          sliderOptions: {
            keyboardStep: CCKCConstants.SLIDER_STEPS.resistorAndLightBulbResistanceNumberControl.step,
            pageKeyboardStep: CCKCConstants.SLIDER_STEPS.resistorAndLightBulbResistanceNumberControl.pageKeyboardStep,
            constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.resistorAndLightBulbResistanceNumberControl.shiftKeyboardStep ),
            startDrag: () => circuitContextResponses.captureState(),
            endDrag: () => {
              const selection = circuit.selectionProperty.value;
              if ( selection instanceof CircuitElement && !isSettingPhetioStateProperty.value ) {
                const response = circuitContextResponses.createValueChangeResponse( selection );
                if ( response ) {
                  circuit.circuitContextAnnouncementEmitter.emit( response );
                }
              }
            }
          },
          numberDisplayOptions: { decimalPlaces: Resistor.RESISTANCE_DECIMAL_PLACES }
        } );
    };
    const createExtremeResistanceNumberControl = ( tandemName: 'extremeResistorResistanceNumberControl' | 'extremeLightBulbResistanceNumberControl', CircuitElementType: GConstructor<LightBulb | Resistor> ) => {
      return new CircuitElementNumberControl( resistanceStringProperty,
        resistanceOhmsValueStringProperty,
        createSingletonAdapterProperty( ResistorType.EXTREME_RESISTOR.defaultResistance, CircuitElementType, circuit, circuitElement => circuitElement.resistanceProperty,
          circuitElement =>
            ( circuitElement instanceof LightBulb && circuitElement.isExtreme ) ||
            ( circuitElement instanceof Resistor && circuitElement.resistorType === ResistorType.EXTREME_RESISTOR )
        ),
        ResistorType.EXTREME_RESISTOR.range, circuit, Resistor.HIGH_RESISTANCE_DECIMAL_PLACES, {
          tandem: circuit.includeLabElements ? tandem.createTandem( tandemName ) : Tandem.OPT_OUT,
          delta: CCKCConstants.SLIDER_STEPS.extremeResistorAndLightBulbResistanceNumberControl.shiftKeyboardStep,
          pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.extremeResistorAndLightBulbResistanceNumberControl.pointerRoundingInterval,
          sliderOptions: {
            keyboardStep: CCKCConstants.SLIDER_STEPS.extremeResistorAndLightBulbResistanceNumberControl.step,
            pageKeyboardStep: CCKCConstants.SLIDER_STEPS.extremeResistorAndLightBulbResistanceNumberControl.pageKeyboardStep,
            constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.extremeResistorAndLightBulbResistanceNumberControl.shiftKeyboardStep ),
            startDrag: () => circuitContextResponses.captureState(),
            endDrag: () => {
              const selection = circuit.selectionProperty.value;
              if ( selection instanceof CircuitElement && !isSettingPhetioStateProperty.value ) {
                const response = circuitContextResponses.createValueChangeResponse( selection );
                if ( response ) {
                  circuit.circuitContextAnnouncementEmitter.emit( response );
                }
              }
            }
          },
          numberDisplayOptions: { decimalPlaces: Resistor.HIGH_RESISTANCE_DECIMAL_PLACES }
        } );
    };

    const resistorResistanceNumberControl = createResistanceNumberControl( 'resistorResistanceNumberControl', Resistor );
    const lightBulbResistanceNumberControl = createResistanceNumberControl( 'lightBulbResistanceNumberControl', LightBulb );
    const extremeResistorResistanceNumberControl = createExtremeResistanceNumberControl( 'extremeResistorResistanceNumberControl', Resistor );
    const extremeLightBulbResistanceNumberControl = createExtremeResistanceNumberControl( 'extremeLightBulbResistanceNumberControl', LightBulb );

    const voltageVoltsValueStringProperty = new PatternStringProperty( voltageVoltsValuePatternStringProperty, { voltage: SunConstants.VALUE_NAMED_PLACEHOLDER } );
    const batteryVoltageNumberControl = new CircuitElementNumberControl( voltageStringProperty,
      voltageVoltsValueStringProperty,
      createSingletonAdapterProperty( Battery.VOLTAGE_DEFAULT, Battery, circuit, battery => battery.voltageProperty, battery => battery.batteryType === 'normal' ),
      Battery.VOLTAGE_RANGE,
      circuit,
      Battery.VOLTAGE_DECIMAL_PLACES, {
        tandem: tandem.createTandem( 'batteryVoltageNumberControl' ),
        delta: CCKCConstants.SLIDER_STEPS.batteryVoltageNumberControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.batteryVoltageNumberControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.batteryVoltageNumberControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.batteryVoltageNumberControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.batteryVoltageNumberControl.shiftKeyboardStep ),
          startDrag: () => circuitContextResponses.captureState(),
          endDrag: () => {
            const selection = circuit.selectionProperty.value;
            if ( selection instanceof CircuitElement && !isSettingPhetioStateProperty.value ) {
              const response = circuitContextResponses.createValueChangeResponse( selection );
              if ( response ) {
                circuit.circuitContextAnnouncementEmitter.emit( response );
              }
            }
          }
        },
        numberDisplayOptions: { decimalPlaces: Battery.VOLTAGE_DECIMAL_PLACES }
      } );
    const extremeBatteryVoltageNumberControl = new CircuitElementNumberControl( voltageStringProperty,
      voltageVoltsValueStringProperty,
      createSingletonAdapterProperty( Battery.HIGH_VOLTAGE_DEFAULT, Battery, circuit, battery => battery.voltageProperty, battery => battery.batteryType === 'high-voltage' ),
      Battery.HIGH_VOLTAGE_RANGE,
      circuit,
      Battery.HIGH_VOLTAGE_DECIMAL_PLACES, {
        tandem: circuit.includeLabElements ? tandem.createTandem( 'extremeBatteryVoltageNumberControl' ) : Tandem.OPT_OUT,
        delta: CCKCConstants.SLIDER_STEPS.extremeBatteryVoltageNumberControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.extremeBatteryVoltageNumberControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.extremeBatteryVoltageNumberControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.extremeBatteryVoltageNumberControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.extremeBatteryVoltageNumberControl.shiftKeyboardStep ),
          startDrag: () => circuitContextResponses.captureState(),
          endDrag: () => {
            const selection = circuit.selectionProperty.value;
            if ( selection instanceof CircuitElement && !isSettingPhetioStateProperty.value ) {
              const response = circuitContextResponses.createValueChangeResponse( selection );
              if ( response ) {
                circuit.circuitContextAnnouncementEmitter.emit( response );
              }
            }
          }
        },
        numberDisplayOptions: { decimalPlaces: Battery.HIGH_VOLTAGE_DECIMAL_PLACES }
      } );

    const phaseShiftControl = new PhaseShiftControl( createSingletonAdapterProperty( 0, ACVoltage, circuit, acVoltage => acVoltage.phaseProperty ), circuit, {
      tandem: circuit.includeACElements ? tandem.createTandem( 'phaseShiftControl' ) : Tandem.OPT_OUT
    } );

    const acVoltageControl = new CircuitElementNumberControl(
      voltageStringProperty,
      voltageVoltsValueStringProperty,
      createSingletonAdapterProperty( 9, ACVoltage, circuit, circuitElement => circuitElement.maximumVoltageProperty ),
      ACVoltage.MAX_VOLTAGE_RANGE,
      circuit,
      2, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'acVoltageControl' ) : Tandem.OPT_OUT,
        delta: CCKCConstants.SLIDER_STEPS.acVoltageControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.acVoltageControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.acVoltageControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.acVoltageControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.acVoltageControl.shiftKeyboardStep )
        },
        getAdditionalVisibilityProperties: circuitElement => {
          return circuitElement instanceof ACVoltage ? [ circuitElement.isVoltageEditableProperty ] : [];
        }
      }
    );

    const acFrequencyControl = new CircuitElementNumberControl(
      frequencyStringProperty,
      new PatternStringProperty( frequencyHzValuePatternStringProperty, { frequency: SunConstants.VALUE_NAMED_PLACEHOLDER } ),
      createSingletonAdapterProperty( ACVoltage.DEFAULT_FREQUENCY, ACVoltage, circuit, circuitElement => circuitElement.frequencyProperty ),
      ACVoltage.FREQUENCY_RANGE,
      circuit,
      2, {
        tandem: circuit.includeACElements ? tandem.createTandem( 'frequencyControl' ) : Tandem.OPT_OUT,
        delta: CCKCConstants.SLIDER_STEPS.frequencyControl.shiftKeyboardStep,
        pointerRoundingInterval: CCKCConstants.SLIDER_STEPS.frequencyControl.pointerRoundingInterval,
        sliderOptions: {
          keyboardStep: CCKCConstants.SLIDER_STEPS.frequencyControl.step,
          pageKeyboardStep: CCKCConstants.SLIDER_STEPS.frequencyControl.pageKeyboardStep,
          constrainValue: ( value: number ) => roundToInterval( value, CCKCConstants.SLIDER_STEPS.frequencyControl.shiftKeyboardStep )
        },
        getAdditionalVisibilityProperties: circuitElement => {
          return circuitElement instanceof ACVoltage ? [ circuitElement.isFrequencyEditableProperty ] : [];
        }
      }
    );

    const tapInstructionText = new Text( tapCircuitElementToEditStringProperty, {
      fontSize: 24,
      maxWidth: 300,
      fill: CCKCColors.textFillProperty,
      tandem: tandem.createTandem( 'tapInstructionText' ),
      phetioVisiblePropertyInstrumented: true,
      visiblePropertyOptions: {

        // Visibility is controlled by the link below
        phetioReadOnly: true
      }
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    const updateInstructionTextVisible = () => {

      if ( !isSettingPhetioStateProperty.value ) {

        // Only fixed length circuit elements are editable, even though wires can be deleted
        const fixedLengthElements = circuit.circuitElements.filter( circuitElement =>
          circuitElement instanceof FixedCircuitElement && circuitElement.interactiveProperty.get()
        );
        tapInstructionText.visible = fixedLengthElements.length > 0;
      }
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
    const disposeActions: Array<() => void> = [];
    circuit.selectionProperty.link( selectedCircuitElement => {
      if ( editNode ) {
        this.hasChild( editNode ) && this.removeChild( editNode );
        if ( editNode !== tapInstructionText ) {
          editNode.dispose();
          disposeActions.forEach( disposeAction => disposeAction() );
          disposeActions.length = 0;
        }
      }

      editNode = null;

      if ( selectedCircuitElement ) {

        if ( selectedCircuitElement instanceof Resistor && selectedCircuitElement.isResistanceEditable() ) {
          const isExtreme = selectedCircuitElement.resistorType === ResistorType.EXTREME_RESISTOR;
          editNode = new EditPanel( [
            isExtreme ? extremeResistorResistanceNumberControl : resistorResistanceNumberControl,
            disconnectButtonContainer,
            trashButtonContainer
          ] );
        }

        // Real bulb has no resistance control
        else if ( selectedCircuitElement instanceof LightBulb && !selectedCircuitElement.isReal ) {
          editNode = new EditPanel( [
              selectedCircuitElement.isExtreme ? extremeLightBulbResistanceNumberControl : lightBulbResistanceNumberControl,
              disconnectButtonContainer,
              trashButtonContainer
            ]
          );
        }
        else if ( selectedCircuitElement instanceof Resistor || ( selectedCircuitElement instanceof LightBulb && selectedCircuitElement.isReal ) ) {

          // Just show disconnect and trash buttons for non-editable resistors which are household items and for isReal bulbs
          editNode = new EditPanel( [
            disconnectButtonContainer,
            trashButtonContainer
          ] );
        }
        else if ( selectedCircuitElement instanceof Battery ) {
          const node = new Node( {
            children: [ batteryReverseContainerNode ],
            excludeInvisibleChildrenFromBounds: true
          } );
          editNode = new EditPanel( [

              // Batteries can be reversed, nest in a Node so the layout will reflow correctly
              node,
              selectedCircuitElement.batteryType === 'high-voltage' ? extremeBatteryVoltageNumberControl : batteryVoltageNumberControl,
              disconnectButtonContainer,
              trashButtonContainer
            ]
          );
          disposeActions.push( () => node.dispose() );
        }
        else if ( selectedCircuitElement instanceof Fuse ) {
          editNode = new EditPanel( [
              fuseRepairButtonContainer,
              fuseCurrentRatingControl,
              disconnectButtonContainer,
              trashButtonContainer
            ]
          );
        }
        else if ( selectedCircuitElement instanceof Switch ) {
          editNode = new EditPanel( [
            switchReadoutNode,
            switchToggleButton,
            disconnectButtonContainer,
            trashButtonContainer
          ] );
        }
        else if ( selectedCircuitElement instanceof SeriesAmmeter || selectedCircuitElement instanceof Wire ) {

          // Just show disconnect and trash buttons
          editNode = new EditPanel( [
            disconnectButtonContainer,
            trashButtonContainer
          ] );
        }
        else if ( selectedCircuitElement instanceof ACVoltage ) {
          const children: Node[] = [
            acVoltageControl,
            acFrequencyControl
          ];

          if ( options.showPhaseShiftControl ) {
            children.push( phaseShiftControl );
          }
          children.push( disconnectButtonContainer );
          children.push( trashButtonContainer );
          editNode = new EditPanel( children );
        }
        else if ( selectedCircuitElement instanceof Capacitor ) {
          editNode = new EditPanel( [
            clearDynamicsButton,
            capacitorEditControl,
            disconnectButtonContainer,
            trashButtonContainer
          ] );
        }
        else if ( selectedCircuitElement instanceof Inductor ) {
          editNode = new EditPanel( [
              clearDynamicsButton,
              inductanceControl,
              disconnectButtonContainer,
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

      if ( selectedCircuitElement instanceof CircuitElement ) {
        const descriptionType = CircuitDescriptionUtils.getDescriptionType( selectedCircuitElement );
        const componentTypeLabel = CircuitDescriptionUtils.getCircuitElementTypeLabel( descriptionType );

        this.accessibleHeading = CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.editPanelHeading.format( {
          componentType: componentTypeLabel
        } );

        this.accessibleHelpText = CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.editPanelHelpText.format( {
          componentType: componentTypeLabel
        } );
        this.accessibleHelpTextBehavior = ParallelDOM.HELP_TEXT_BEFORE_CONTENT;
      }
    } );

    visibleBoundsProperty.link( updatePosition );
    this.localBoundsProperty.link( updatePosition );
  }
}

/**
 * Panel to facilitate in visual layout of the controls.
 */
class EditPanel extends Panel {
  private readonly hbox: HBox;

  public constructor( children: Node[] ) {
    const hbox = new HBox( {
      spacing: 20,
      align: 'bottom',
      children: children
    } );
    super( hbox, {
      fill: CCKCColors.editPanelFillProperty,
      stroke: null,
      xMargin: 10,
      yMargin: 10,
      cornerRadius: 10,
      align: 'center'
    } );
    this.hbox = hbox;
  }

  public override dispose(): void {
    this.hbox.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );
