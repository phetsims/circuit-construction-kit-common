// Copyright 2019-2021, University of Colorado Boulder

/**
 * Button that resets a Fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import Fuse from '../model/Fuse.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';

class ResetFuseButton extends CCKCRoundPushButton {

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

    super( {
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

    let oldFuse: Fuse | null = null;
    circuit.selectedCircuitElementProperty.link( fuse => {
      if ( fuse instanceof Fuse ) {
        oldFuse && oldFuse.isTrippedProperty.unlink( isTrippedListener );
        fuse.isTrippedProperty.link( isTrippedListener );
        oldFuse = fuse;
      }
    } );
  }

  // @public
  dispose() {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'ResetFuseButton', ResetFuseButton );
export default ResetFuseButton;