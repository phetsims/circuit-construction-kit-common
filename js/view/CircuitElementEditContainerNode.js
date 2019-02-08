// Copyright 2016-2017, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementEditNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditNode' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const SwitchReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchReadoutNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  // strings
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

  /**
   * @param {Circuit} circuit - the circuit model
   * @param {Property.<boolean>} visibleBoundsProperty - the visible bounds in view coordinates
   * @param {Property.<InteractionMode>} modeProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitElementEditContainerNode( circuit, visibleBoundsProperty, modeProperty, tandem ) {
    const groupTandem = tandem.createGroupTandem( 'circuitElementEditNode' );
    Node.call( this );

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

  circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );

  return inherit( Node, CircuitElementEditContainerNode );
} );