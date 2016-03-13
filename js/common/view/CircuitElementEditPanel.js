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
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var Range = require( 'DOT/Range' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Battery' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  function CircuitElementEditPanel( circuit, visibleBoundsProperty ) {
    var selectedCircuitElementProperty = circuit.lastCircuitElementProperty;
    var circuitElementEditPanel = this;
    Node.call( this );

    var tapInstructionTextNode = new Text( 'Tap circuit element to edit.', {
      fontSize: 24
    } );

    // Only show the instructions if there is a circuit element in the play area, so students don't try to tap
    // something in the toolbox.
    var listener = function() {
      var circuitElements = circuit.getCircuitElements();

      // Only fixed length circuit elements are editable
      var fixedLengthElements = circuitElements.filter( function( circuitElement ) {
        return circuitElement instanceof FixedLengthCircuitElement;
      } );
      tapInstructionTextNode.visible = fixedLengthElements.length > 0;
    };
    circuit.circuitElementDroppedEmitter.addListener( listener );
    listener(); // Update on startup, like link()

    this.addChild( new Rectangle( 0, 0, 10, 10, { fill: null } ) ); // blank spacer so layout doesn't exception out
    var updatePosition = function() {
      var visibleBounds = visibleBoundsProperty.get();
      circuitElementEditPanel.centerX = visibleBounds.centerX;
      circuitElementEditPanel.bottom = visibleBounds.bottom - 14; // TODO: Factor out insets
    };

    var lastNumberControl = null;
    selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      lastNumberControl && lastNumberControl.dispose();
      lastNumberControl && circuitElementEditPanel.removeChild( lastNumberControl );
      lastNumberControl = null;

      var font = new PhetFont( 14 );
      var numberControlOptions = {
        titleFont: font,
        valueFont: font,
        decimalPlaces: 1
      };

      if ( selectedCircuitElement ) {
        if ( selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb ) {

          lastNumberControl = new HBox( {
            spacing: 40,
            align: 'bottom',
            children: [
              new NumberControl( 'Resistance', selectedCircuitElement.resistanceProperty, new Range( 0, 100 ), _.extend( {
                units: 'ohms'
              }, numberControlOptions ) ),
              new RoundPushButton( {
                baseColor: 'yellow',
                content: new FontAwesomeNode( 'trash', {
                  scale: CircuitConstructionKitBasicsConstants.fontAwesomeIconScale
                } )
              } )
            ]
          } );
        }
        else if ( selectedCircuitElement instanceof Battery ) {
          lastNumberControl = new NumberControl( 'Voltage', selectedCircuitElement.voltageProperty, new Range( 0, 100 ), _.extend( {
            units: 'volts'
          }, numberControlOptions ) );
        }
        else {
          lastNumberControl = null;
        }
      }
      else {
        lastNumberControl = tapInstructionTextNode;
      }
      if ( lastNumberControl !== null ) {
        circuitElementEditPanel.addChild( lastNumberControl );
      }
      updatePosition();
    } );

    visibleBoundsProperty.link( updatePosition );
  }

  return inherit( Node, CircuitElementEditPanel, {} );
} );