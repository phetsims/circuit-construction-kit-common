// Copyright 2016-2020, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Panel from '../../../sun/js/Panel.js';
import SunConstants from '../../../sun/js/SunConstants.js';
import PhetioGroup from '../../../tandem/js/PhetioGroup.js';
import PhetioGroupIO from '../../../tandem/js/PhetioGroupIO.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
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
import ClearDynamicsButtonIO from './ClearDynamicsButtonIO.js';
import PhaseShiftControl from './PhaseShiftControl.js';
import ResetFuseButton from './ResetFuseButton.js';
import ReverseBatteryButton from './ReverseBatteryButton.js';
import ReverseBatteryButtonIO from './ReverseBatteryButtonIO.js';
import SwitchReadoutNode from './SwitchReadoutNode.js';
import TrashButton from './TrashButton.js';
import TrashButtonIO from './TrashButtonIO.js';

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
const GET_LAYOUT_POSITION = visibleBounds => {
  return {
    centerX: visibleBounds.centerX,
    bottom: visibleBounds.bottom - CCKCConstants.VERTICAL_MARGIN
  };
};

class CircuitElementEditContainerNode extends Node {

  /**
   * @param {Circuit} circuit - the circuit model
   * @param {Property.<boolean>} visibleBoundsProperty - the visible bounds in view coordinates
   * @param {Property.<InteractionMode>} modeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( circuit, visibleBoundsProperty, modeProperty, tandem, options ) {

    super();

    options = merge( {
      showPhaseShiftControl: false
    }, options );
    const groupTandem = tandem.createGroupTandem( 'circuitElementEditNode' );

    const trashButtonGroup = new PhetioGroup(
      ( tandem, circuitElement ) => new TrashButton( circuit, circuitElement, tandem ),
      [ null ], {
        phetioType: PhetioGroupIO( TrashButtonIO ),
        tandem: tandem.createTandem( 'trashButtonGroup' )
      } );

    const clearDynamicsButtonGroup = new PhetioGroup(
      ( tandem, circuitElement ) => new ClearDynamicsButton( circuitElement, tandem ),
      [ null ], {
        phetioType: PhetioGroupIO( ClearDynamicsButtonIO ),
        tandem: tandem.createTandem( 'clearDynamicsButtonGroup' )
      } );

    const reverseBatteryButtonGroup = new PhetioGroup(
      ( tandem, circuitElement ) => new ReverseBatteryButton( circuit, circuitElement, tandem ),
      [ null ], {
        phetioType: PhetioGroupIO( ReverseBatteryButtonIO ),
        tandem: tandem.createTandem( 'reverseBatteryButtonGroup' )
      } );

    const tapInstructionTextNode = new Text( tapCircuitElementToEditString, {
      fontSize: 24,
      maxWidth: 300
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    const updateInstructionTextVisible = () => {

      // Only fixed length circuit elements are editable, even though wires can be deleted
      const fixedLengthElements = circuit.circuitElements.getArray().filter( circuitElement =>
        circuitElement instanceof FixedCircuitElement && circuitElement.interactiveProperty.get()
      );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };

    circuit.vertexDroppedEmitter.addListener( updateInstructionTextVisible );

    // Also update on reset all, or if a component is dropped in the toolbox
    circuit.vertexGroup.addMemberDisposedListener( updateInstructionTextVisible );
    modeProperty.link( updateInstructionTextVisible );

    const updatePosition = () => {

      // Layout, but only if we have something to display (otherwise bounds fail out)
      this.bounds.isValid() && this.mutate( GET_LAYOUT_POSITION( visibleBoundsProperty.get() ) );
    };

    // When the selected element changes, update the displayed controls
    let editNode = null;
    circuit.selectedCircuitElementProperty.link( selectedCircuitElement => {
      editNode && this.hasChild( editNode ) && this.removeChild( editNode );
      ( editNode && editNode !== tapInstructionTextNode ) && !editNode.isDisposed && editNode.dispose();
      editNode = null;

      if ( selectedCircuitElement ) {
        const isResistive = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
        const isBattery = selectedCircuitElement instanceof Battery;
        const isFuse = selectedCircuitElement instanceof Fuse;
        const isWire = selectedCircuitElement instanceof Wire;
        const isSwitch = selectedCircuitElement instanceof Switch;
        const isSeriesAmmeter = selectedCircuitElement instanceof SeriesAmmeter;
        const isACSource = selectedCircuitElement instanceof ACVoltage;
        const isCapacitor = selectedCircuitElement instanceof Capacitor;
        const isInductor = selectedCircuitElement instanceof Inductor;

        if ( isResistive && selectedCircuitElement.isResistanceEditable() ) {
          const resistanceControl = new CircuitElementNumberControl(
            resistanceString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( resistanceOhmsValuePatternString, {
              resistance: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.resistanceProperty,
            circuit,
            selectedCircuitElement,
            groupTandem.createNextTandem()
          );
          editNode = new EditPanel( [
              resistanceControl,
              trashButtonGroup.createNextMember( selectedCircuitElement )
            ]
          );
        }
        else if ( isResistive ) {

          // Just show a trash button for non-editable resistors which are household items
          editNode = trashButtonGroup.createNextMember( selectedCircuitElement );
        }
        else if ( isBattery ) {
          const circuitElementEditNode = new CircuitElementNumberControl(
            voltageString,

            // Adapter to take from {{named}} to {{value}} for usage in common code
            StringUtils.fillIn( voltageVoltsValuePatternString, {
              voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
            } ),
            selectedCircuitElement.voltageProperty,
            circuit,
            selectedCircuitElement,
            groupTandem.createNextTandem(), {

              // TODO: Set the delta correctly for this and high voltage battery, and for high resistance resistor.
              // TODO: See values from https://github.com/phetsims/circuit-construction-kit-common/commit/73e4b297759b7d8bbd12e319e574a589e2b76e8a
              phetioState: false
            }
          );

          editNode = new EditPanel( [

              // Batteries can be reversed
              reverseBatteryButtonGroup.createNextMember( selectedCircuitElement ),
              circuitElementEditNode,
              trashButtonGroup.createNextMember( selectedCircuitElement )
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
            groupTandem.createNextTandem(), {
              editableRange: selectedCircuitElement.currentRatingProperty.range
            }
          );

          editNode = new EditPanel( [

              // Batteries can be reversed
              new ResetFuseButton( selectedCircuitElement, tandem.createTandem( 'resetFuseButton' ) ),
              fuseCurrentRatingControl,
              trashButtonGroup.createNextMember( selectedCircuitElement )
            ]
          );
        }
        else if ( isSwitch ) {
          editNode = new SwitchReadoutNode( circuit, selectedCircuitElement, groupTandem.createNextTandem(), trashButtonGroup );
        }
        else if ( isSeriesAmmeter || isWire ) {

          // Just show a trash button
          editNode = trashButtonGroup.createNextMember( selectedCircuitElement );
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
              groupTandem.createNextTandem()
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
              groupTandem.createNextTandem(), {
                delta: 0.1,
                editableRange: new Range( 0.1, 2 )
              }
            ) ];

          if ( options.showPhaseShiftControl ) {
            children.push( new PhaseShiftControl( selectedCircuitElement, {
              tandem: groupTandem.createNextTandem()
            } ) );
          }
          children.push( trashButtonGroup.createNextMember( selectedCircuitElement ) );
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
            groupTandem.createNextTandem(), {
              delta: 0.01,
              editableRange: selectedCircuitElement.capacitanceProperty.range
            }
          );

          editNode = new EditPanel( [
            clearDynamicsButtonGroup.createNextMember( selectedCircuitElement ),
            capacitorEditControl,
            trashButtonGroup.createNextMember( selectedCircuitElement )
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
            groupTandem.createNextTandem(), {
              editableRange: selectedCircuitElement.inductanceProperty.range
            }
          );
          editNode = new EditPanel( [
              clearDynamicsButtonGroup.createNextMember( selectedCircuitElement ),
              inductanceControl,
              trashButtonGroup.createNextMember( selectedCircuitElement )
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
      spacing: 40,
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
    super( new EditHBox( children ), {
      fill: '#caddfa',
      stroke: null,
      xMargin: 13,
      yMargin: 13,
      cornerRadius: 13
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );
export default CircuitElementEditContainerNode;