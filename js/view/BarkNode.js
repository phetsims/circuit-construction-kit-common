// Copyright 2020, University of Colorado Boulder

/**
 * Speech bubble with "!!!" shown when the dog barks.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import FontAwesomeNode from '../../../sun/js/FontAwesomeNode.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Node from '../../../scenery/js/nodes/Node.js';

class BarkNode extends Node {

  constructor( options ) {
    super();
    this.addChild( new FontAwesomeNode( 'comment', {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1.5,
      scale: new Vector2( -1, 1 )
    } ) );
    const mainScale = new Vector2( 1, 1 );
    const rotation = Math.PI * 2 / 20;
    const a = new FontAwesomeNode( 'exclamation', {
      scale: mainScale.timesScalar( 0.8 ),
      rotation: -rotation
    } );

    const b = new FontAwesomeNode( 'exclamation', {
      scale: mainScale
    } );

    const c = new FontAwesomeNode( 'exclamation', {
      scale: mainScale.timesScalar( 0.8 ),
      rotation: rotation
    } );
    this.addChild( new HBox( {
      scale: 0.5,
      children: [ a, b, c ],
      align: 'bottom',
      spacing: 6,
      center: this.center.plusXY( 0, -3 )
    } ) );

    this.mutate( options );
  }
}

circuitConstructionKitCommon.register( 'BarkNode', BarkNode );
export default BarkNode;