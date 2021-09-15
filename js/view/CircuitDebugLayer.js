// Copyright 2021, University of Colorado Boulder

/**
 * For debugging current values and directions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Panel from '../../../sun/js/Panel.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CurrentSense from '../model/CurrentSense.js';

class CircuitDebugLayer extends Node {
  constructor( circuitLayerNode ) {
    super();
    this.circuitLayerNode = circuitLayerNode;
    this.rebuild();
  }

  // @public
  step() {
    this.rebuild();
  }

  // @private
  rebuild() {
    this.removeAllChildren();
    this.circuitLayerNode.circuit.circuitElements.forEach( circuitElement => {
      const start = circuitElement.startVertexProperty.value.positionProperty.value;
      const end = circuitElement.endVertexProperty.value.positionProperty.value;
      const arrowNode = new ArrowNode( start.x, start.y, end.x, end.y, {
        fill: 'red',
        stroke: 'black',
        lineWidth: 2
      } );
      this.addChild( arrowNode );
      const textNode = new Text( circuitElement.currentProperty.value.toFixed( 2 ) ); //eslint-disable-line
      const panel = new Panel( textNode, {
        center: arrowNode.center,
        fill: circuitElement.currentSenseProperty.value === CurrentSense.FORWARD ? 'red' :
              circuitElement.currentSenseProperty.value === CurrentSense.BACKWARD ? 'rgba(137, 196, 244, 1)' : 'white'
      } );
      this.addChild( panel );
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitDebugLayer', CircuitDebugLayer );
export default CircuitDebugLayer;
