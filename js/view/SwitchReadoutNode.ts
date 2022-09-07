// Copyright 2017-2022, University of Colorado Boulder

/**
 * Readout that appears in the CircuitElementEditContainerNode that displays whether the switch is open or closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Node, Text } from '../../../scenery/js/imports.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import Switch from '../model/Switch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CircuitElement from '../model/CircuitElement.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Vertex from '../model/Vertex.js';

const theSwitchIsClosedStringProperty = CircuitConstructionKitCommonStrings.theSwitchIsClosedStringProperty;
const theSwitchIsOpenStringProperty = CircuitConstructionKitCommonStrings.theSwitchIsOpenStringProperty;

// constants
const MAX_TEXT_WIDTH = 300;

export default class SwitchReadoutNode extends Node {
  public constructor( circuit: Circuit, tandem: Tandem, trashButton: Node ) {

    // Create both texts and display both so they remain aligned as the value changes
    const createText = ( string: TReadOnlyProperty<string>, tandem: Tandem ) =>
      new Text( string, {
        fontSize: 24,
        maxWidth: MAX_TEXT_WIDTH,
        tandem: tandem,
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      } );

    const messageNodeTandem = tandem.createTandem( 'messageNode' );
    const closedText = createText( theSwitchIsClosedStringProperty, messageNodeTandem.createTandem( 'closedTextNode' ) );
    const openText = createText( theSwitchIsOpenStringProperty, messageNodeTandem.createTandem( 'openTextNode' ) );

    const closedListener = ( closed: boolean ) => {
      closedText.visible = closed;
      openText.visible = !closed;
    };

    // This is reused across all switches
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof Switch && oldCircuitElement.closedProperty.unlink( closedListener );
      newCircuitElement instanceof Switch && newCircuitElement.closedProperty.link( closedListener );
    } );

    const update = () => {
      const maxWidth = Math.max( closedText.width, openText.width );

      // Show a trash button to the right of the text
      trashButton.mutate( {
        left: maxWidth + 10,
        centerY: closedText.centerY
      } );
    };

    update();
    closedText.boundsProperty.link( update );
    openText.boundsProperty.link( update );

    const messageNode = new Node( {
      children: [ closedText, openText ],
      tandem: messageNodeTandem
    } );

    super( {
      children: [ messageNode, trashButton ],
      tandem: tandem
    } );
  }
}

circuitConstructionKitCommon.register( 'SwitchReadoutNode', SwitchReadoutNode );