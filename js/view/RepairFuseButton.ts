// Copyright 2019-2022, University of Colorado Boulder

/**
 * Button that resets a Fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import { Circle, HBox } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Path } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import Fuse from '../model/Fuse.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import CircuitElement from '../model/CircuitElement.js';

class RepairFuseButton extends HBox {

  /**
   * @param {Circuit} circuit
   * @param {Tandem} tandem
   */
  constructor( circuit: Circuit, tandem: Tandem ) {

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

    const button = new CCKCRoundPushButton( {
      touchAreaDilation: 5, // radius dilation for touch area
      content: icon,
      listener: () => {
        const fuse = circuit.selectedCircuitElementProperty.value;
        assert && assert( fuse instanceof Fuse );
        if ( fuse instanceof Fuse ) {
          fuse.resetFuse();
        }
      },
      tandem: tandem
    } );

    const isTrippedListener = ( isTripped: boolean ) => this.setEnabled( isTripped );

    const isRepairableListener = ( isRepairable: boolean ) => {
      this.visible = isRepairable;
    };

    // This is reused across all instances.  The button itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectedCircuitElementProperty.link( ( newCircuitElement: CircuitElement | null, oldCircuitElement: CircuitElement | null ) => {
      oldCircuitElement instanceof Fuse && oldCircuitElement.isRepairableProperty.unlink( isRepairableListener );
      newCircuitElement instanceof Fuse && newCircuitElement.isRepairableProperty.link( isRepairableListener );

      oldCircuitElement instanceof Fuse && oldCircuitElement.isTrippedProperty.unlink( isTrippedListener );
      newCircuitElement instanceof Fuse && newCircuitElement.isTrippedProperty.link( isTrippedListener );
    } );

    super( { children: [ button ] } );
  }

  // @public
  dispose() {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'RepairFuseButton', RepairFuseButton );
export default RepairFuseButton;