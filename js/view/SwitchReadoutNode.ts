// Copyright 2017-2025, University of Colorado Boulder

/**
 * Readout that appears in the CircuitElementEditContainerNode that displays whether the switch is open or closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import Line from '../../../scenery/js/nodes/Line.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import Switch from '../model/Switch.js';
import type Vertex from '../model/Vertex.js';
import CCKCColors from './CCKCColors.js';

const theSwitchIsClosedStringProperty = CircuitConstructionKitCommonFluent.theSwitchIsClosedStringProperty;
const theSwitchIsOpenStringProperty = CircuitConstructionKitCommonFluent.theSwitchIsOpenStringProperty;

// constants
const MAX_TEXT_WIDTH = 300;

// Height to match the buttons in the edit panel for vertical centering
const TARGET_HEIGHT = 46;

export default class SwitchReadoutNode extends Node {

  public constructor( circuit: Circuit, tandem: Tandem ) {

    // Create both texts and display both so they remain aligned as the value changes
    const createText = ( string: TReadOnlyProperty<string>, tandem: Tandem ) =>
      new Text( string, {
        fontSize: 24,
        maxWidth: MAX_TEXT_WIDTH,
        fill: CCKCColors.textFillProperty,
        tandem: tandem,
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      } );

    const closedText = createText( theSwitchIsClosedStringProperty, tandem.createTandem( 'closedText' ) );
    const openText = createText( theSwitchIsOpenStringProperty, tandem.createTandem( 'openText' ) );

    const closedListener = ( closed: boolean ) => {
      closedText.visible = closed;
      openText.visible = !closed;
    };

    // This is reused across all switches
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof Switch && oldCircuitElement.isClosedProperty.unlink( closedListener );
      newCircuitElement instanceof Switch && newCircuitElement.isClosedProperty.link( closedListener );
    } );

    const messageNode = new Node( {
      children: [ closedText, openText ]
    } );

    // Invisible vertical strut to give the node consistent height for vertical centering in the HBox
    const strut = new Line( 0, 0, 0, TARGET_HEIGHT, { stroke: null } );

    // Use VBox to center the text vertically within the target height
    const centeredContent = new HBox( {
      spacing: 0,
      children: [ messageNode ],
      minContentHeight: TARGET_HEIGHT,
      justify: 'center'
    } );

    super( {
      children: [ strut, centeredContent ],
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'SwitchReadoutNode', SwitchReadoutNode );