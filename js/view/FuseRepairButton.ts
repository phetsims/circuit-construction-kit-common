// Copyright 2019-2023, University of Colorado Boulder

/**
 * Button that resets a Fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Circle, Node, Path } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import Fuse from '../model/Fuse.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import CircuitElement from '../model/CircuitElement.js';
import Vertex from '../model/Vertex.js';
import { RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';

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
      listener: () => {
        const fuse = circuit.selectionProperty.value;

        // eslint-disable-next-line no-simple-type-checking-assertions
        assert && assert( fuse instanceof Fuse );
        if ( fuse instanceof Fuse ) {
          fuse.resetFuse();
          circuit.componentEditedEmitter.emit();
        }
      }
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

  public override dispose(): void {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'FuseRepairButton', FuseRepairButton );