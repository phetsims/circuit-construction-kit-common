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
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Wire' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var CircuitElementEditPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementEditPanel' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // strings
  var tapCircuitElementToEditString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tapCircuitElementToEdit' );

  // constants
  var GET_LAYOUT_POSITION = function( visibleBounds ) {
    return {
      centerX: visibleBounds.centerX,
      bottom: visibleBounds.bottom - CircuitConstructionKitConstants.LAYOUT_INSET
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
      var fixedLengthElements = circuit.circuitElements.filter( function( circuitElement ) {
        return circuitElement instanceof FixedLengthCircuitElement && circuitElement.interactiveProperty.get();
      } );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };

    circuit.vertexDroppedEmitter.addListener( listener );
    circuit.vertices.addItemRemovedListener( listener ); // Also update on reset all, or if a component is dropped in the toolbox
    modeProperty.link( listener );

    // blank spacer so layout doesn't exception out
    this.addChild( new Rectangle( 0, 0, 10, 10, { fill: null } ) );
    var updatePosition = function() {
      self.mutate( GET_LAYOUT_POSITION( visibleBoundsProperty.get() ) );
    };

    // When the selected element changes, update the displayed controls
    var lastNumberControl = null;
    circuit.selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      lastNumberControl && self.removeChild( lastNumberControl );
      lastNumberControl && lastNumberControl !== tapInstructionTextNode && lastNumberControl.dispose();
      lastNumberControl = null;

      if ( selectedCircuitElement ) {
        var resistor = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
        var battery = selectedCircuitElement instanceof Battery;
        var wire = selectedCircuitElement instanceof Wire;

        // TODO: i18n
        var text = (resistor || wire) ? 'Resistance' :
                   battery ? 'Voltage' :
                   null;
        var units = (resistor || wire) ? 'ohms' :
                    battery ? 'volts' :
                    null;
        var property = (resistor || wire) ? selectedCircuitElement.resistanceProperty :
                       battery ? selectedCircuitElement.voltageProperty :
                       null;
        var options = wire ? { numberControlEnabled: false } : {};

        assert && assert( property, 'property should not be null' );
        lastNumberControl = new CircuitElementEditPanel( text, units, property, circuit, selectedCircuitElement, groupTandem.createNextTandem(), options );
      }
      else {
        lastNumberControl = tapInstructionTextNode;
      }
      if ( lastNumberControl !== null ) {
        self.addChild( lastNumberControl );
      }
      updatePosition();
    } );

    visibleBoundsProperty.link( updatePosition );
  }

  circuitConstructionKitCommon.register( 'CircuitElementEditContainerPanel', CircuitElementEditContainerPanel );

  return inherit( Node, CircuitElementEditContainerPanel );
} );