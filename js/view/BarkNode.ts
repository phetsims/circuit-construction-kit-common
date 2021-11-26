// Copyright 2020-2021, University of Colorado Boulder

/**
 * Speech bubble with "!!!" shown when the dog barks.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import { HBox } from '../../../scenery/js/imports.js';
import { Path } from '../../../scenery/js/imports.js';
import commentSolidShape from '../../../sherpa/js/fontawesome-5/commentSolidShape.js';
import exclamationSolidShape from '../../../sherpa/js/fontawesome-5/exclamationSolidShape.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Node, { NodeOptions } from '../../../scenery/js/nodes/Node.js';

class BarkNode extends Node {

  /**
   * @param {Object} [providedOptions]
   */
  constructor( providedOptions?: Partial<NodeOptions> ) {
    super();
    this.addChild( new Path( commentSolidShape, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5 * 15,
      scale: new Vector2( -1, 1 )
    } ) );
    const mainScale = new Vector2( 0.9, 0.9 );
    const rotation = Math.PI * 2 / 20;
    const a = new Path( exclamationSolidShape, {
      fill: 'black',
      scale: mainScale.timesScalar( 0.8 ),
      rotation: -rotation
    } );

    const b = new Path( exclamationSolidShape, {
      fill: 'black',
      scale: mainScale
    } );

    const c = new Path( exclamationSolidShape, {
      fill: 'black',
      scale: mainScale.timesScalar( 0.8 ),
      rotation: rotation
    } );
    this.addChild( new HBox( {
      scale: 0.5,
      children: [ a, b, c ],
      align: 'bottom',
      spacing: 60,
      center: this.center.plusXY( 0, -3 )
    } ) );

    this.mutate( providedOptions );
  }
}

circuitConstructionKitCommon.register( 'BarkNode', BarkNode );
export default BarkNode;