// Copyright 2016-2022, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { HBox } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
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
import ResetFuseButton from './ResetFuseButton.js';
import ReverseBatteryButton from './ReverseBatteryButton.js';
import SwitchReadoutNode from './SwitchReadoutNode.js';
import TrashButton from './TrashButton.js';
import CircuitElement from '../model/CircuitElement.js';

const capacitanceString = circuitConstructionKitCommonStrings.capacitance;
const capacitanceUnitsString = circuitConstructionKitCommonStrings.capacitanceUnits;
const currentRatingString = circuitConstructionKitCommonStrings.currentRating;
const currentUnitsString = circuitConstructionKitCommonStrings.currentUnits;
const frequencyHzValuePatternString = circuitConstructionKitCommonStrings.frequencyHzValuePattern;
const frequencyString = circuitConstructionKitCommonStrings.frequency;
const inductanceString = circuitConstructionKitCommonStrings.inductance;
const inductanceUnitsString = circuitConstructionKitCommonStrings.inductanceUnits;
const resistanceOhmsValuePatternString = circuitConstructionKitCommonStrings.resistanceOhmsValuePattern;
const resistanceString = circuitConstructionKitCommonStrings.resistance;
const tapCircuitElementToEditString = circuitConstructionKitCommonStrings.tapCircuitElementToEdit;
const voltageString = circuitConstructionKitCommonStrings.voltage;
const voltageVoltsValuePatternString = circuitConstructionKitCommonStrings.voltageVoltsValuePattern;

// constants
const GET_LAYOUT_POSITION = ( visibleBounds: Bounds2, centerX: number ) => {
  return {
    centerX: centerX,
    bottom: visibleBounds.bottom - CCKCConstants.HORIZONTAL_MARGIN
  };
};

// So we can pass classes as types for instanceof checks, I've been using https://www.typescriptlang.org/docs/handbook/mixins.html
// as a reference for how to create this type
type GConstructor<T = {}> = new ( ...args: any[] ) => T;

const NORMAL_SLIDER_KNOB_DELTA = 1;
const HIGH_SLIDER_KNOB_DELTA = 100;
const NORMAL_TWEAKER_DELTA = 0.1;
const HIGH_TWEAKER_DELTA = 10;

// TODO: Consider moving this into CircuitElementNumberControl once we have built them all, see https://github.com/phetsims/circuit-construction-kit-common/issues/797
const createSingletonAdapterProperty = <T extends CircuitElement>(
  initialValue: number,
  CircuitElementType: GConstructor<T>,
  circuit: Circuit,
  getter: ( circuitElement: T ) => Property<number> ) => {

  // Cannot use DynamicProperty.derivedProperty since the selected circuit element isn't always a Fuse
  const singletonAdapterProperty = new Property( initialValue, {} );
  singletonAdapterProperty.link( fuseRating => {
    if ( circuit.selectedCircuitElementProperty.value && circuit.selectedCircuitElementProperty.value instanceof CircuitElementType ) {
      getter( circuit.selectedCircuitElementProperty.value ).value = fuseRating;
    }
  } );

  // When the value in the model changes, say from PhET-iO, we propagate it back to the control
  const modelListener = ( currentRating: number ) => singletonAdapterProperty.set( currentRating );
  circuit.selectedCircuitElementProperty.link( ( newCircuitElement, oldCircuitElement ) => {
    oldCircuitElement instanceof CircuitElementType && getter( oldCircuitElement ).unlink( modelListener );
    newCircuitElement instanceof CircuitElementType && getter( newCircuitElement ).link( modelListener );
  } );
  return singletonAdapterProperty;
};

class CircuitElementEditContainerNode extends Node {

  /**
   * @param {Circuit} circuit - the circuit model
   * @param {Property.<Bounds2>} visibleBoundsProperty - the visible bounds in view coordinates
   * @param {Property.<InteractionMode>} modeProperty
   * @param {Property.<Number>} playAreaCenterXProperty
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( circuit: Circuit, visibleBoundsProperty: Property<Bounds2>, modeProperty: Property<'explore' | 'test'>, playAreaCenterXProperty: Property<number>, tandem: Tandem, providedOptions?: any ) {

    super();

    providedOptions = merge( {
      showPhaseShiftControl: false
    }, providedOptions );

    // Create reusable components that will get assembled into a panel for the selected circuit element
    const trashButton = new TrashButton( circuit, tandem.createTandem( 'trashButton' ) );
    const resetFuseButton = new ResetFuseButton( circuit, tandem.createTandem( 'resetFuseButton' ) );
    const clearDynamicsButton = new ClearDynamicsButton( circuit, tandem.createTandem( 'clearDynamicsButton' ) );
    const reverseBatteryButton = new ReverseBatteryButton( circuit, tandem.createTandem( 'reverseBatteryButton' ) );

    // For PhET-iO, NumberControls are created statically on startup and switch between which CircuitElement it controls.
    const fuseCurrentRatingControl = new CircuitElementNumberControl( currentRatingString,
      StringUtils.fillIn( currentUnitsString, {
        current: SunConstants.VALUE_NAMED_PLACEHOLDER
      } ),
      createSingletonAdapterProperty( Fuse.DEFAULT_CURRENT_RATING, Fuse, circuit, ( c: Fuse ) => c.currentRatingProperty ),
      Fuse.RANGE,
      circuit,

      // TODO: https://github.com/phetsims/circuit-construction-kit-common/issues/513 Eliminate numberOfDecimalPlaces: 1 from Fuse and places like it
      1, {
        tandem: tandem.createTandem( 'currentRatingControl' ),
        delta: NORMAL_TWEAKER_DELTA, // For the tweakers
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, 0.5 )
        }
      }
    );

    const capacitorEditControl = new CircuitElementNumberControl( capacitanceString,
      StringUtils.fillIn( capacitanceUnitsString, {
        capacitance: SunConstants.VALUE_NAMED_PLACEHOLDER
      } ),
      createSingletonAdapterProperty( Capacitor.CAPACITANCE_DEFAULT, Capacitor, circuit, ( c: Capacitor ) => c.capacitanceProperty ),
      Capacitor.CAPACITANCE_RANGE,
      circuit,
      Capacitor.NUMBER_OF_DECIMAL_PLACES, {
        tandem: tandem.createTandem( 'capacitanceNumberControl' ),
        delta: CCKCQueryParameters.capacitanceStep
      }
    );

    const inductanceControl = new CircuitElementNumberControl( inductanceString,
      StringUtils.fillIn( inductanceUnitsString, {
        inductance: SunConstants.VALUE_NAMED_PLACEHOLDER
      } ),
      createSingletonAdapterProperty( Inductor.INDUCTANCE_DEFAULT, Inductor, circuit, ( c: Inductor ) => c.inductanceProperty ),
      Inductor.INDUCTANCE_RANGE,
      circuit,
      Inductor.INDUCTANCE_NUMBER_OF_DECIMAL_PLACES, {
        tandem: tandem.createTandem( 'inductanceNumberControl' ),
        delta: CCKCQueryParameters.inductanceStep,

        // For dragging the slider knob
        sliderOptions: {
          constrainValue: ( value: number ) => Utils.roundToInterval( value, 0.1 )
        }
      }
    );

    const tapInstructionTextNode = new Text( tapCircuitElementToEditString, {
      fontSize: 24,
      maxWidth: 300
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    const updateInstructionTextVisible = () => {

      // Only fixed length circuit elements are editable, even though wires can be deleted
      const fixedLengthElements = circuit.circuitElements.filter( circuitElement =>
        circuitElement instanceof FixedCircuitElement && circuitElement.interactiveProperty.get()
      );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
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
    circuit.selectedCircuitElementProperty.link( selectedCircuitElement => {
      if ( editNode ) {
        this.hasChild( editNode ) && this.removeChild( editNode );
        if ( editNode !== tapInstructionTextNode && editNode !== trashButton ) {
          editNode.dispose();
        }
      }

      editNode = null;

      if ( selectedCircuitElement ) {
        const isResistive = selectedCircuitElement instanceof Resistor || ( selectedCircuitElement instanceof LightBulb && !selectedCircuitElement.real );
        const isBattery = selectedCircuitElement instanceof Battery;
        const isFuse = selectedCircuitElement instanceof Fuse;
        const isWire = selectedCircuitElement instanceof Wire;
        const isSwitch = selectedCircuitElement instanceof Switch;
        const isSeriesAmmeter = selectedCircuitElement instanceof SeriesAmmeter;
        const isACSource = selectedCircuitElement instanceof ACVoltage;
        const isCapacitor = selectedCircuitElement instanceof Capacitor;
        const isInductor = selectedCircuitElement instanceof Inductor;

        if ( isResistive && selectedCircuitElement.isResistanceEditable() ) {

          // @ts-ignore
          const isHighResistance = selectedCircuitElement.resistorType === ResistorType.HIGH_RESISTANCE_RESISTOR ||
                                   selectedCircuitElement instanceof LightBulb && selectedCircuitElement.highResistance;

          const resistanceControl = new CircuitElementNumberControl(
            resistanceString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( resistanceOhmsValuePatternString, {
              resistance: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.resistanceProperty,
            selectedCircuitElement.resistanceProperty.range!,
            circuit,
            selectedCircuitElement.numberOfDecimalPlaces, {
              tandem: Tandem.OPT_OUT,

              // For the tweakers
              delta: isHighResistance ? HIGH_TWEAKER_DELTA : NORMAL_TWEAKER_DELTA,

              // For dragging the slider knob
              sliderOptions: {
                constrainValue: ( value: number ) => Utils.roundToInterval( value, isHighResistance ? HIGH_SLIDER_KNOB_DELTA : NORMAL_SLIDER_KNOB_DELTA )
              },
              numberDisplayOptions: {
                decimalPlaces: selectedCircuitElement.numberOfDecimalPlaces
              }
            }
          );

          editNode = new EditPanel( [
              resistanceControl,
              trashButton
            ]
          );
        }
        else if ( isResistive || ( selectedCircuitElement instanceof LightBulb && selectedCircuitElement.real ) ) {

          // Just show a trash button for non-editable resistors which are household items and for real bulbs
          editNode = trashButton;
        }
        else if ( isBattery ) {
          const knobDelta = selectedCircuitElement.batteryType === 'high-voltage' ?
                            HIGH_SLIDER_KNOB_DELTA : NORMAL_SLIDER_KNOB_DELTA;
          const circuitElementEditNode = new CircuitElementNumberControl(
            voltageString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( voltageVoltsValuePatternString, {
              voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.voltageProperty,
            selectedCircuitElement.voltageProperty.range!,
            circuit,
            selectedCircuitElement.numberOfDecimalPlaces, {
              tandem: Tandem.OPT_OUT,

              // For the tweakers
              delta: selectedCircuitElement.batteryType === 'high-voltage' ? HIGH_TWEAKER_DELTA : NORMAL_TWEAKER_DELTA,

              // For dragging the slider knob
              sliderOptions: {
                constrainValue: ( value: number ) => Utils.roundToInterval( value, knobDelta )
              },
              numberDisplayOptions: {
                decimalPlaces: selectedCircuitElement.numberOfDecimalPlaces
              },
              phetioState: false
            }
          );

          editNode = new EditPanel( [

              // Batteries can be reversed
              reverseBatteryButton,
              circuitElementEditNode,
              trashButton
            ]
          );
        }
        else if ( isFuse ) {
          editNode = new EditPanel( [
              resetFuseButton,
              fuseCurrentRatingControl,
              trashButton
            ]
          );
        }
        else if ( isSwitch ) {

          // TODO: https://github.com/phetsims/circuit-construction-kit-common/issues/513 should this be instrumented?
          editNode = new SwitchReadoutNode( circuit, selectedCircuitElement, Tandem.OPT_OUT, trashButton );
        }
        else if ( isSeriesAmmeter || isWire ) {

          // Just show a trash button
          editNode = trashButton;
        }
        else if ( isACSource ) {
          const children: Node[] = [
            new CircuitElementNumberControl(
              voltageString,

              // Adapter to take from {{named}} to {{value}} for usage in common code
              StringUtils.fillIn( voltageVoltsValuePatternString, {
                voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
              } ),
              selectedCircuitElement.maximumVoltageProperty,
              selectedCircuitElement.maximumVoltageProperty.range!,
              circuit,
              selectedCircuitElement.numberOfDecimalPlaces,
              Tandem.OPT_OUT
            ),
            new CircuitElementNumberControl(
              frequencyString,

              // Adapter to take from {{named}} to {{value}} for usage in common code
              StringUtils.fillIn( frequencyHzValuePatternString, {
                frequency: SunConstants.VALUE_NAMED_PLACEHOLDER
              } ),
              selectedCircuitElement.frequencyProperty,
              selectedCircuitElement.frequencyProperty.range!,
              circuit,
              selectedCircuitElement.numberOfDecimalPlaces, {
                tandem: Tandem.OPT_OUT,
                delta: 0.01
              }
            ) ];

          if ( providedOptions.showPhaseShiftControl ) {
            children.push( new PhaseShiftControl( selectedCircuitElement, {
              tandem: Tandem.OPT_OUT
            } ) );
          }
          children.push( trashButton );
          editNode = new EditPanel( children );
        }
        else if ( isCapacitor ) {
          editNode = new EditPanel( [
            clearDynamicsButton,
            capacitorEditControl,
            trashButton
          ] );
        }
        else if ( isInductor ) {
          editNode = new EditPanel( [
              clearDynamicsButton,
              inductanceControl,
              trashButton
            ]
          );
        }
      }
      else {
        editNode = tapInstructionTextNode;
      }
      if ( editNode !== null ) {
        this.addChild( editNode );

        if ( editNode === tapInstructionTextNode || editNode instanceof SwitchReadoutNode ) {
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
  /**
   * @param {Array.<Node>} children
   */
  constructor( children: Node[] ) {
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

  /**
   * @param {Array.<Node>} children
   */
  constructor( children: Node[] ) {
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

  // @public
  dispose() {
    this.hbox.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );
export default CircuitElementEditContainerNode;
