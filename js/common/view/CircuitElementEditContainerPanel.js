// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
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

  // constants
  var GET_LAYOUT_POSITION = function( visibleBounds ) {
    return {
      centerX: visibleBounds.centerX,
      bottom: visibleBounds.bottom - CircuitConstructionKitConstants.layoutInset
    };
  };

  function CircuitElementEditContainerPanel( circuit, visibleBoundsProperty, getLayoutPosition, modeProperty, tandem ) {
    var groupTandem = tandem.createGroupTandem( 'circuitElementEditPanel' );
    var selectedCircuitElementProperty = circuit.selectedCircuitElementProperty;
    var self = this;
    Node.call( this );

    // TODO: i18n
    var tapInstructionTextNode = new Text( 'Tap circuit element to edit.', {
      fontSize: 24
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    var listener = function() {
      var circuitElements = circuit.getCircuitElements();

      // Only fixed length circuit elements are editable, even though wires can be deleted
      var fixedLengthElements = circuitElements.filter( function( circuitElement ) {
        return circuitElement instanceof FixedLengthCircuitElement && circuitElement.interactiveProperty.get();
      } );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };

    circuit.vertexDroppedEmitter.addListener( listener );
    circuit.vertices.addItemRemovedListener( listener ); // Also update on reset all, or if a component is dropped in the toolbox
    modeProperty.link( listener );
    listener(); // Update on startup, like link()

    this.addChild( new Rectangle( 0, 0, 10, 10, { fill: null } ) ); // blank spacer so layout doesn't exception out
    var updatePosition = function() {
      self.mutate( getLayoutPosition( visibleBoundsProperty.get() ) );
    };

    var lastNumberControl = null;
    selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      lastNumberControl && lastNumberControl.dispose();
      lastNumberControl && self.removeChild( lastNumberControl );
      lastNumberControl = null;

      if ( selectedCircuitElement ) {
        var resistor = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
        var battery = selectedCircuitElement instanceof Battery;
        var wire = selectedCircuitElement instanceof Wire;

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

  return inherit( Node, CircuitElementEditContainerPanel, {}, {
    GET_LAYOUT_POSITION: GET_LAYOUT_POSITION
  } );
} );