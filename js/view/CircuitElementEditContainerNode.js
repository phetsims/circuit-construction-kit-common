// Copyright 2016-2020, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Panel from '../../../sun/js/Panel.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
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
const GET_LAYOUT_POSITION = ( visibleBounds, centerX ) => {
  return {
    centerX: centerX,
    bottom: visibleBounds.bottom - CCKCConstants.HORIZONTAL_MARGIN
  };
};

const NORMAL_SLIDER_KNOB_DELTA = 1;
const HIGH_SLIDER_KNOB_DELTA = 100;
const NORMAL_TWEAKER_DELTA = 0.1;
const HIGH_TWEAKER_DELTA = 10;

class CircuitElementEditContainerNode extends Node {

  /**
   * @param {Circuit} circuit - the circuit model
   * @param {Property.<boolean>} visibleBoundsProperty - the visible bounds in view coordinates
   * @param {Property.<InteractionMode>} modeProperty
   * @param {Property.<Number>} playAreaCenterXProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( circuit, visibleBoundsProperty, modeProperty, playAreaCenterXProperty, tandem, options ) {

    super();

    options = merge( {
      showPhaseShiftControl: false
    }, options );

    const trashButton = new TrashButton( circuit, tandem.createTandem( 'trashButton' ) );
    const resetFuseButton = new ResetFuseButton( circuit, tandem.createTandem( 'resetFuseButton' ) );
    const clearDynamicsButton = new ClearDynamicsButton( circuit, tandem.createTandem( 'clearDynamicsButton' ) );
    const reverseBatteryButton = new ReverseBatteryButton( circuit, tandem.createTandem( 'reverseBatteryButton' ) );

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
    let editNode = null;
    circuit.selectedCircuitElementProperty.link( selectedCircuitElement => {
      if ( editNode ) {
        this.hasChild( editNode ) && this.removeChild( editNode );
        if ( editNode !== tapInstructionTextNode && editNode !== trashButton ) {
          editNode.dispose();
        }
      }

      editNode = null;

      if ( selectedCircuitElement ) {
        const isResistive = selectedCircuitElement instanceof Resistor || ( selectedCircuitElement instanceof LightBulb && !selectedCircuitElement.realistic );
        const isBattery = selectedCircuitElement instanceof Battery;
        const isFuse = selectedCircuitElement instanceof Fuse;
        const isWire = selectedCircuitElement instanceof Wire;
        const isSwitch = selectedCircuitElement instanceof Switch;
        const isSeriesAmmeter = selectedCircuitElement instanceof SeriesAmmeter;
        const isACSource = selectedCircuitElement instanceof ACVoltage;
        const isCapacitor = selectedCircuitElement instanceof Capacitor;
        const isInductor = selectedCircuitElement instanceof Inductor;

        if ( isResistive && selectedCircuitElement.isResistanceEditable() ) {

          const isHighResistance = selectedCircuitElement.resistorType === Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR ||
                                   selectedCircuitElement instanceof LightBulb && selectedCircuitElement.highResistance;
          const resistanceControl = new CircuitElementNumberControl(
            resistanceString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( resistanceOhmsValuePatternString, {
              resistance: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.resistanceProperty,
            circuit,
            selectedCircuitElement,
            Tandem.OPT_OUT, {

              // For the tweakers
              delta: isHighResistance ? HIGH_TWEAKER_DELTA : NORMAL_TWEAKER_DELTA,

              // For dragging the slider knob
              sliderOptions: {
                constrainValue: value => Utils.roundToInterval( value, isHighResistance ? HIGH_SLIDER_KNOB_DELTA : NORMAL_SLIDER_KNOB_DELTA )
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
        else if ( isResistive || ( selectedCircuitElement instanceof LightBulb && selectedCircuitElement.realistic ) ) {

          // Just show a trash button for non-editable resistors which are household items and for realistic bulbs
          editNode = trashButton;
        }
        else if ( isBattery ) {
          const knobDelta = selectedCircuitElement.batteryType === Battery.BatteryType.HIGH_VOLTAGE ?
                            HIGH_SLIDER_KNOB_DELTA : NORMAL_SLIDER_KNOB_DELTA;
          const circuitElementEditNode = new CircuitElementNumberControl(
            voltageString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( voltageVoltsValuePatternString, {
              voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.voltageProperty,
            circuit,
            selectedCircuitElement,
            Tandem.OPT_OUT, {

              // For the tweakers
              delta: selectedCircuitElement.batteryType === Battery.BatteryType.HIGH_VOLTAGE ? HIGH_TWEAKER_DELTA : NORMAL_TWEAKER_DELTA,

              // For dragging the slider knob
              sliderOptions: {
                constrainValue: value => Utils.roundToInterval( value, knobDelta )
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
          const fuseCurrentRatingControl = new CircuitElementNumberControl( currentRatingString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( currentUnitsString, {
              current: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.currentRatingProperty,
            circuit,
            selectedCircuitElement,
            Tandem.OPT_OUT, {
              editableRange: selectedCircuitElement.currentRatingProperty.range
            }
          );

          editNode = new EditPanel( [
              resetFuseButton,
              fuseCurrentRatingControl,
              trashButton
            ]
          );
        }
        else if ( isSwitch ) {
          editNode = new SwitchReadoutNode( circuit, selectedCircuitElement, Tandem.OPT_OUT, trashButton );
        }
        else if ( isSeriesAmmeter || isWire ) {

          // Just show a trash button
          editNode = trashButton;
        }
        else if ( isACSource ) {
          const children = [
            new CircuitElementNumberControl(
              voltageString,

              // Adapter to take from {{named}} to {{value}} for usage in common code
              StringUtils.fillIn( voltageVoltsValuePatternString, {
                voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
              } ),
              selectedCircuitElement.maximumVoltageProperty,
              circuit,
              selectedCircuitElement,
              Tandem.OPT_OUT
            ),
            new CircuitElementNumberControl(
              frequencyString,

              // Adapter to take from {{named}} to {{value}} for usage in common code
              StringUtils.fillIn( frequencyHzValuePatternString, {
                frequency: SunConstants.VALUE_NAMED_PLACEHOLDER
              } ),
              selectedCircuitElement.frequencyProperty,
              circuit,
              selectedCircuitElement,
              Tandem.OPT_OUT, {
                delta: 0.1,
                editableRange: new Range( 0.1, 2 )
              }
            ) ];

          if ( options.showPhaseShiftControl ) {
            children.push( new PhaseShiftControl( selectedCircuitElement, {
              tandem: Tandem.OPT_OUT
            } ) );
          }
          children.push( trashButton );
          editNode = new EditPanel( children );
        }
        else if ( isCapacitor ) {
          const capacitorEditControl = new CircuitElementNumberControl( capacitanceString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( capacitanceUnitsString, {
              capacitance: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.capacitanceProperty,
            circuit,
            selectedCircuitElement,
            Tandem.OPT_OUT, {
              delta: 0.01,
              editableRange: selectedCircuitElement.capacitanceProperty.range
            }
          );

          editNode = new EditPanel( [
            clearDynamicsButton,
            capacitorEditControl,
            trashButton
          ] );
        }
        else if ( isInductor ) {
          const inductanceControl = new CircuitElementNumberControl( inductanceString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( inductanceUnitsString, {
              inductance: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.inductanceProperty,
            circuit,
            selectedCircuitElement,
            Tandem.OPT_OUT, {
              editableRange: selectedCircuitElement.inductanceProperty.range
            }
          );
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

        if ( editNode === tapInstructionTextNode ) {
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
  constructor( children ) {
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
  constructor( children ) {
    const hbox = new EditHBox( children );
    super( hbox, {
      fill: '#caddfa',
      stroke: null,
      xMargin: 10,
      yMargin: 10,
      cornerRadius: 10
    } );

    // @private
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
