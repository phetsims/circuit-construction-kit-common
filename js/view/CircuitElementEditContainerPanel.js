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
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var CircuitElementEditPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditPanel' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var SwitchReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchReadoutNode' );
  var TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var tapCircuitElementToEditString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tapCircuitElementToEdit' );
  var resistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistance' );
  var voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );
  var resistanceOhmsValuePatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsValuePattern' );
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
   * @param {Property.<string>} modeProperty - 'explore'|'test' for Black Box Study
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitElementEditContainerPanel( circuit, visibleBoundsProperty, modeProperty, tandem ) {
    var groupTandem = tandem.createGroupTandem( 'circuitElementEditPanel' );
    var self = this;
    Node.call( this );

    var tapInstructionTextNode = new Text( tapCircuitElementToEditString, {
      fontSize: 24,
      maxWidth: 300
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    var listener = function() {

      // Only fixed length circuit elements are editable, even though wires can be deleted
      var fixedLengthElements = circuit.circuitElements.getArray().filter( function( circuitElement ) {
        return circuitElement instanceof FixedLengthCircuitElement && circuitElement.interactiveProperty.get();
      } );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };

    circuit.vertexDroppedEmitter.addListener( listener );

    // Also update on reset all, or if a component is dropped in the toolbox
    circuit.vertices.addItemRemovedListener( listener );
    modeProperty.link( listener );

    var updatePosition = function() {

      // Layout, but only if we have something to display (otherwise bounds fail out)
      self.children.length > 0 && self.mutate( GET_LAYOUT_POSITION( visibleBoundsProperty.get() ) );
    };

    // When the selected element changes, update the displayed controls
    var previousPanel = null;
    circuit.selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      previousPanel && self.removeChild( previousPanel );
      (previousPanel && previousPanel !== tapInstructionTextNode) && previousPanel.dispose();
      previousPanel = null;

      if ( selectedCircuitElement ) {
        var isResistor = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
        var isBattery = selectedCircuitElement instanceof Battery;
        var isWire = selectedCircuitElement instanceof Wire;
        var isSwitch = selectedCircuitElement instanceof Switch;
        var isSeriesAmmeter = selectedCircuitElement instanceof SeriesAmmeter;

        if ( isResistor && selectedCircuitElement.isResistanceEditable() ) {
          previousPanel = new CircuitElementEditPanel(
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

          // Just show a trash button for non-editable resistors which are grab bag items
          previousPanel = new TrashButton(
            circuit, selectedCircuitElement, groupTandem.createNextTandem().createTandem( 'trashButton' )
          );
        }
        else if ( isBattery ) {
          previousPanel = new CircuitElementEditPanel(
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
          previousPanel = new SwitchReadoutNode( circuit, selectedCircuitElement, groupTandem.createNextTandem() );
        }
        else if ( isSeriesAmmeter || isWire ) {

          // Just show a trash button
          previousPanel = new TrashButton(
            circuit, selectedCircuitElement, groupTandem.createNextTandem().createTandem( 'trashButton' )
          );
        }
      }
      else {
        previousPanel = tapInstructionTextNode;
      }
      if ( previousPanel !== null ) {
        self.addChild( previousPanel );

        if ( previousPanel === tapInstructionTextNode ) {
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

  circuitConstructionKitCommon.register( 'CircuitElementEditContainerPanel', CircuitElementEditContainerPanel );

  return inherit( Node, CircuitElementEditContainerPanel );
} );