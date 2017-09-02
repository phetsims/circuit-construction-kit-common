// Copyright 2016-2017, University of Colorado Boulder

/**
 * This popup control appears at the bottom of the screen and shows circuit element-specific controls, like a
 * resistance control for resistors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var CircuitElementEditNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditNode' );
  var SwitchReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchReadoutNode' );
  var TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var resistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistance' );
  var resistanceOhmsValuePatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsValuePattern' );
  var tapCircuitElementToEditString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tapCircuitElementToEdit' );
  var voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );
  var voltageVoltsValuePatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageVoltsValuePattern' );

  // constants
  var GET_LAYOUT_POSITION = function( visibleBounds ) {
    return {
      centerX: visibleBounds.centerX,
      bottom: visibleBounds.bottom - CircuitConstructionKitCommonConstants.VERTICAL_MARGIN
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
    var groupTandem = tandem.createGroupTandem( 'circuitElementEditNode' );
    var self = this;
    Node.call( this );

    var tapInstructionTextNode = new Text( tapCircuitElementToEditString, {
      fontSize: 24,
      maxWidth: 300
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    var updateInstructionTextVisible = function() {

      // Only fixed length circuit elements are editable, even though wires can be deleted
      var fixedLengthElements = circuit.circuitElements.getArray().filter( function( circuitElement ) {
        return circuitElement instanceof FixedCircuitElement && circuitElement.interactiveProperty.get();
      } );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };

    circuit.vertexDroppedEmitter.addListener( updateInstructionTextVisible );

    // Also update on reset all, or if a component is dropped in the toolbox
    circuit.vertices.addItemRemovedListener( updateInstructionTextVisible );
    modeProperty.link( updateInstructionTextVisible );

    var updatePosition = function() {

      // Layout, but only if we have something to display (otherwise bounds fail out)
      //REVIEW: Generally recommend self.bounds.isValid() as the guard for this type of thing
      //REVIEW^(samreid): Like this?
      self.bounds.isValid() && self.mutate( GET_LAYOUT_POSITION( visibleBoundsProperty.get() ) );
    };

    // When the selected element changes, update the displayed controls
    var editNode = null;
    circuit.selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      editNode && self.removeChild( editNode );
      ( editNode && editNode !== tapInstructionTextNode ) && editNode.dispose();
      editNode = null;

      if ( selectedCircuitElement ) {
        var isResistor = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
        var isBattery = selectedCircuitElement instanceof Battery;
        var isWire = selectedCircuitElement instanceof Wire;
        var isSwitch = selectedCircuitElement instanceof Switch;
        var isSeriesAmmeter = selectedCircuitElement instanceof SeriesAmmeter;

        if ( isResistor && selectedCircuitElement.isResistanceEditable() ) {
          editNode = new CircuitElementEditNode(
            resistanceString,

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
        self.addChild( editNode );

        if ( editNode === tapInstructionTextNode ) {
          self.mouseArea = null;
          self.touchArea = null;
        }
        else {

          // Clicking nearby (but not directly on) a tweaker button or slider shouldn't dismiss the edit panel,
          // see https://github.com/phetsims/circuit-construction-kit-dc/issues/90
          self.mouseArea = self.localBounds.dilatedX( 20 );
          self.touchArea = self.localBounds.dilatedX( 20 );
        }
      }
      updatePosition();
    } );

    visibleBoundsProperty.link( updatePosition );
  }

  circuitConstructionKitCommon.register( 'CircuitElementEditContainerNode', CircuitElementEditContainerNode );

  return inherit( Node, CircuitElementEditContainerNode );
} );