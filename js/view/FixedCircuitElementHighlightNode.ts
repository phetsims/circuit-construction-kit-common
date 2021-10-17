// Copyright 2017-2021, University of Colorado Boulder

/**
 * Node used by FixedCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';

// constants
const CORNER_RADIUS = 8; // in view coordinates

class FixedCircuitElementHighlightNode extends Rectangle {

  /**
   * @param {FixedCircuitElementNode} fixedCircuitElementNode
   */
  constructor( fixedCircuitElementNode: FixedCircuitElementNode ) {

    super( 0, 0, 0, 0,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: CCKCConstants.HIGHLIGHT_COLOR,
        lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
        pickable: false
      } );

    this.recomputeBounds( fixedCircuitElementNode );
  }

  /**
   * Update the dimensions of the highlight, called on startup and when components change from lifelike/schematic.
   * @param {FixedCircuitElementNode} fixedCircuitElementNode
   * @public
   */
  recomputeBounds( fixedCircuitElementNode: FixedCircuitElementNode ) {

    // This is called rarely and hence the extra allocation is OK
    this.setRectBounds( fixedCircuitElementNode.getHighlightBounds() );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementHighlightNode', FixedCircuitElementHighlightNode );
export default FixedCircuitElementHighlightNode;