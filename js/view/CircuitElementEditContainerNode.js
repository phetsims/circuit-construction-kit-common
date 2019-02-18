// Copyright 2016-2019, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACSource = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACSource' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementEditNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditNode' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Range = require( 'DOT/Range' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const SunConstants = require( 'SUN/SunConstants' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const SwitchReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchReadoutNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  // strings
  const frequencyHzValuePatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/frequencyHzValuePattern' );
  const frequencyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/frequency' );
  const resistanceOhmsValuePatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsValuePattern' );
  const resistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistance' );
  const tapCircuitElementToEditString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tapCircuitElementToEdit' );
  const voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );
  const voltageVoltsValuePatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageVoltsValuePattern' );

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
     */
    constructor( circuit, visibleBoundsProperty, modeProperty, tandem ) {
      const groupTandem = tandem.createGroupTandem( 'circuitElementEditNode' );
      super();

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
      circuit.vertices.addItemRemovedListener( updateInstructionTextVisible );
      modeProperty.link( updateInstructionTextVisible );

      const updatePosition = () => {

        // Layout, but only if we have something to display (otherwise bounds fail out)
        this.bounds.isValid() && this.mutate( GET_LAYOUT_POSITION( visibleBoundsProperty.get() ) );
      };

      // When the selected element changes, update the displayed controls
      let editNode = null;
      circuit.selectedCircuitElementProperty.link( selectedCircuitElement => {
        editNode && this.removeChild( editNode );
        ( editNode && editNode !== tapInstructionTextNode ) && editNode.dispose();
        editNode = null;

        if ( selectedCircuitElement ) {
          const isResistor = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
          const isBattery = selectedCircuitElement instanceof Battery;
          const isWire = selectedCircuitElement instanceof Wire;
          const isSwitch = selectedCircuitElement instanceof Switch;
          const isSeriesAmmeter = selectedCircuitElement instanceof SeriesAmmeter;
          const isACSource = selectedCircuitElement instanceof ACSource;

          if ( isResistor && selectedCircuitElement.isResistanceEditable() ) {
            editNode = new CircuitElementEditNode(
              resistanceString,

              //TODO #444 replace '{0}' with SunConstants.VALUE_NAMED_PLACEHOLDER
              // Adapter to take from {{named}} to {0} for usage in common code
              StringUtils.fillIn( resistanceOhmsValuePatternString, {
                resistance: '{0}'
              } ),
              selectedCircuitElement.resistanceProperty,
              circuit,
              selectedCircuitElement,
              groupTandem.createNextTandem()
            );
          }
          else if ( isResistor ) {

            // Just show a trash button for non-editable resistors which are household items
            editNode = new TrashButton(
              circuit, selectedCircuitElement, groupTandem.createNextTandem().createTandem( 'trashButton' )
            );
          }
          else if ( isBattery ) {
            editNode = new CircuitElementEditNode(
              voltageString,

              //TODO #444 replace '{0}' with SunConstants.VALUE_NAMED_PLACEHOLDER
              // Adapter to take from {{named}} to {0} for usage in common code
              StringUtils.fillIn( voltageVoltsValuePatternString, {
                voltage: '{0}'
              } ),
              selectedCircuitElement.voltageProperty,
              circuit,
              selectedCircuitElement,
              groupTandem.createNextTandem()
            );
          }
          else if ( isSwitch ) {
            editNode = new SwitchReadoutNode( circuit, selectedCircuitElement, groupTandem.createNextTandem() );
          }
          else if ( isSeriesAmmeter || isWire ) {

            // Just show a trash button
            editNode = new TrashButton(
              circuit, selectedCircuitElement, groupTandem.createNextTandem().createTandem( 'trashButton' )
            );
          }
          else if ( isACSource ) {
            editNode = new HBox( {
              spacing: 30,
              children: [
                new CircuitElementEditNode(
                  voltageString,

                  //TODO #444 replace '{0}' with SunConstants.VALUE_NAMED_PLACEHOLDER
                  // Adapter to take from {{named}} to {0} for usage in common code
                  StringUtils.fillIn( voltageVoltsValuePatternString, {
                    voltage: SunConstants.VALUE_NAMED_PLACEHOLDER
                  } ),
                  selectedCircuitElement.maximumVoltageProperty,
                  circuit,
                  selectedCircuitElement,
                  groupTandem.createNextTandem(), {
                    showTrashCan: false
                  }
                ),
                new CircuitElementEditNode(
                  frequencyString,

                  //TODO #444 replace '{0}' with SunConstants.VALUE_NAMED_PLACEHOLDER
                  // Adapter to take from {{named}} to {0} for usage in common code
                  StringUtils.fillIn( frequencyHzValuePatternString, {
                    frequency: SunConstants.VALUE_NAMED_PLACEHOLDER
                  } ),
                  selectedCircuitElement.frequencyProperty,
                  circuit,
                  selectedCircuitElement,
                  groupTandem.createNextTandem(), {

                    // TODO: We need a different feature for this.  Maybe each CircuitElement has a map of editable things, not
                    // TODO: just one editable thing.
                    delta: 0.1,
                    editableRange: new Range( 0.1, 2 ) // TODO: what range here?
                  }
                ) ]
            } );
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

  return circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );
} );