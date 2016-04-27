// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Battery' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Wire' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );
  var CircuitElementEditPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditPanel' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  // constants
  var GET_LAYOUT_POSITION = function( visibleBounds ) {
    return {
      centerX: visibleBounds.centerX,
      bottom: visibleBounds.bottom - CircuitConstructionKitBasicsConstants.layoutInset
    };
  };

  function CircuitElementEditContainerPanel( circuit, visibleBoundsProperty, options ) {
    options = _.extend( {
      getLayoutPosition: GET_LAYOUT_POSITION
    }, options );
    var selectedCircuitElementProperty = circuit.selectedCircuitElementProperty;
    var circuitElementEditContainerPanel = this;
    Node.call( this );

    var tapInstructionTextNode = new Text( 'Tap circuit element to edit.', {
      fontSize: 24
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    var listener = function() {
      var circuitElements = circuit.getCircuitElements();

      // Only fixed length circuit elements are editable, even though wires can be deleted
      var fixedLengthElements = circuitElements.filter( function( circuitElement ) {
        return circuitElement instanceof FixedLengthCircuitElement;
      } );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };
    circuit.circuitElementDroppedEmitter.addListener( listener );
    listener(); // Update on startup, like link()

    this.addChild( new Rectangle( 0, 0, 10, 10, { fill: null } ) ); // blank spacer so layout doesn't exception out
    var updatePosition = function() {
      circuitElementEditContainerPanel.mutate( options.getLayoutPosition( visibleBoundsProperty.get() ) );
    };

    var lastNumberControl = null;
    selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      lastNumberControl && lastNumberControl.dispose();
      lastNumberControl && circuitElementEditContainerPanel.removeChild( lastNumberControl );
      lastNumberControl = null;

      if ( selectedCircuitElement ) {
        var res = selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb;
        var bat = selectedCircuitElement instanceof Battery;
        var wir = selectedCircuitElement instanceof Wire;
        lastNumberControl = res ? new CircuitElementEditPanel( 'Resistance', 'ohms', selectedCircuitElement.resistanceProperty, circuit, selectedCircuitElement ) :
                            bat ? new CircuitElementEditPanel( 'Voltage', 'volts', selectedCircuitElement.voltageProperty, circuit, selectedCircuitElement ) :
                            wir ? new CircuitElementEditPanel( 'Resistance', 'ohms', selectedCircuitElement.resistanceProperty, circuit, selectedCircuitElement, { numberControlEnabled: false } ) :
                            null;
      }
      else {
        lastNumberControl = tapInstructionTextNode;
      }
      if ( lastNumberControl !== null ) {
        circuitElementEditContainerPanel.addChild( lastNumberControl );
      }
      updatePosition();
    } );

    visibleBoundsProperty.link( updatePosition );
  }

  return inherit( Node, CircuitElementEditContainerPanel, {}, {
    GET_LAYOUT_POSITION: GET_LAYOUT_POSITION
  } );
} );