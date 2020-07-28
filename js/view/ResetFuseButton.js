// Copyright 2019-2020, University of Colorado Boulder

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
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';

class ResetFuseButton extends CCKCRoundPushButton {

  /**
   * @param {Fuse} fuse - the Fuse to reset
   * @param {Tandem} tandem
   */
  constructor( fuse, tandem ) {

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
      content: icon,
      listener: () => fuse.resetFuse(),
      tandem: tandem,
      phetioDynamicElement: true
    } );
    fuse.isTrippedProperty.link( isTripped => {
      this.setEnabled( isTripped );
    } );
  }
}

circuitConstructionKitCommon.register( 'ResetFuseButton', ResetFuseButton );
export default ResetFuseButton;