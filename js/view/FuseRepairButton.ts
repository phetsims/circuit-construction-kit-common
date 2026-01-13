// Copyright 2019-2025, University of Colorado Boulder

/**
 * Button that resets a Fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import { type RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import Fuse from '../model/Fuse.js';
import type Vertex from '../model/Vertex.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';

type SelfOptions = EmptySelfOptions;
type RepairFuseButtonOptions = SelfOptions & RoundPushButtonOptions;

export default class FuseRepairButton extends CCKCRoundPushButton {

  public constructor( circuit: Circuit, providedOptions?: RepairFuseButtonOptions ) {

    const shape = new Shape().moveTo( 0, 0 ).zigZagToPoint( new Vector2( 35, 0 ), 4.7, 4, false );

    const icon = new Node( {
      children: [ new Path( shape, {
        stroke: 'black',
        lineWidth: 1.2,
        centerX: 0,
        centerY: 0
      } ), new Circle( 2.2, { fill: 'black', centerX: 0, centerY: 0 } ) ],
      scale: 0.9 // to match the size of the trash can icon
    } );

    const options = optionize<RepairFuseButtonOptions, SelfOptions, RoundPushButtonOptions>()( {
      enabledPropertyOptions: { tandem: Tandem.OPT_OUT },
      touchAreaDilation: 5, // radius dilation for touch area
      content: icon,
      accessibleName: CircuitConstructionKitCommonFluent.a11y.fuseRepairButton.accessibleNameStringProperty,
      listener: () => {
        const fuse = circuit.selectionProperty.value;


        affirm( fuse instanceof Fuse );
        fuse.resetFuse();
        circuit.componentEditedEmitter.emit();
      },
      isDisposable: false
    }, providedOptions );

    super( options );

    const isTrippedListener = ( isTripped: boolean ) => this.setEnabled( isTripped );

    // This is reused across all instances.  The button itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof Fuse && oldCircuitElement.isTrippedProperty.unlink( isTrippedListener );
      newCircuitElement instanceof Fuse && newCircuitElement.isTrippedProperty.link( isTrippedListener );
    } );
  }
}

circuitConstructionKitCommon.register( 'FuseRepairButton', FuseRepairButton );