// Copyright 2025-2026, University of Colorado Boulder

/**
 * Button that toggles a Switch between open and closed states.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Line from '../../../scenery/js/nodes/Line.js';
import Node from '../../../scenery/js/nodes/Node.js';
import { type RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import Switch from '../model/Switch.js';
import type Vertex from '../model/Vertex.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';

// constants - scaled down version of the switch for the icon
const ICON_SCALE = 0.40;
const SWITCH_LENGTH = 112 * ICON_SCALE;
const SWITCH_START = 1 / 3; // fraction along the switch to the pivot
const SWITCH_END = 2 / 3; // fraction along the switch to the connection point
const LINE_WIDTH = 3;
const CIRCLE_RADIUS = 3;
const OPEN_ANGLE = -Math.PI / 4; // 45 degrees up, same as SwitchNode

// Height for the invisible vertical struts to center the icon and match other button sizes
const STRUT_HALF_HEIGHT = 12;

type SelfOptions = EmptySelfOptions;
type SwitchToggleButtonOptions = SelfOptions & RoundPushButtonOptions;

export default class SwitchToggleButton extends CCKCRoundPushButton {

  public constructor( circuit: Circuit, providedOptions?: SwitchToggleButtonOptions ) {

    const pivotX = SWITCH_LENGTH * SWITCH_START;
    const contactX = SWITCH_LENGTH * SWITCH_END;

    // Left segment: from start to pivot
    const leftSegment = new Line( 0, 0, pivotX, 0, {
      stroke: 'black',
      lineWidth: LINE_WIDTH,
      lineCap: 'round'
    } );

    // Right segment: from contact to end
    const rightSegment = new Line( contactX, 0, SWITCH_LENGTH, 0, {
      stroke: 'black',
      lineWidth: LINE_WIDTH,
      lineCap: 'round'
    } );

    // Circle at pivot (right end of left segment)
    const pivotCircle = new Circle( CIRCLE_RADIUS, { fill: 'black', centerX: pivotX, centerY: 0 } );

    // Circle at contact (left end of right segment)
    const contactCircle = new Circle( CIRCLE_RADIUS, { fill: 'black', centerX: contactX, centerY: 0 } );

    // Rotating segment: connects pivot to contact, rotates around pivot
    const rotatingSegment = new Line( pivotX, 0, contactX, 0, {
      stroke: 'black',
      lineWidth: LINE_WIDTH,
      lineCap: 'round'
    } );

    // Invisible vertical struts at both ends to ensure consistent height and vertical centering
    const centerX = SWITCH_LENGTH / 2;
    const leftStrut = new Line( centerX, -STRUT_HALF_HEIGHT, centerX, STRUT_HALF_HEIGHT, {
      stroke: 'transparent'
    } );

    const icon = new Node( {
      children: [ leftStrut, leftSegment, rightSegment, rotatingSegment, pivotCircle, contactCircle ]
    } );

    const options = optionize<SwitchToggleButtonOptions, SelfOptions, RoundPushButtonOptions>()( {
      touchAreaDilation: 5,
      content: icon,
      listener: () => {
        const switchElement = circuit.selectionProperty.value;

        if ( switchElement instanceof Switch ) {
          switchElement.isClosedProperty.value = !switchElement.isClosedProperty.value;
          circuit.componentEditedEmitter.emit();
        }
      },
      isDisposable: false
    }, providedOptions );

    super( options );

    // Update the icon when the switch state changes
    const updateIcon = ( isClosed: boolean ) => {
      if ( isClosed ) {

        // The button allows you to open the switch: rotating segment is angled up from pivot
        const segmentLength = contactX - pivotX;
        const endX = pivotX + segmentLength * Math.cos( OPEN_ANGLE );
        const endY = segmentLength * Math.sin( OPEN_ANGLE );
        rotatingSegment.setLine( pivotX, 0, endX, endY );

      }
      else {

        // The button allows you to close the switch: rotating segment is horizontal, connecting pivot to contact
        rotatingSegment.setLine( pivotX, 0, contactX, 0 );
      }
    };

    // Combined listener for both icon update and accessible name update
    const isClosedListener = ( isClosed: boolean ) => {
      updateIcon( isClosed );
      this.accessibleName = isClosed ?
                            CircuitConstructionKitCommonFluent.a11y.switchToggleButton.openSwitchStringProperty :
                            CircuitConstructionKitCommonFluent.a11y.switchToggleButton.closeSwitchStringProperty;
    };

    // Dynamically link to the selected switch's isClosedProperty
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      if ( oldCircuitElement instanceof Switch ) {
        oldCircuitElement.isClosedProperty.unlink( isClosedListener );
      }
      if ( newCircuitElement instanceof Switch ) {
        newCircuitElement.isClosedProperty.link( isClosedListener );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'SwitchToggleButton', SwitchToggleButton );
