// Copyright 2017-2025, University of Colorado Boulder

/**
 * Node used by FixedCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import TPaint from '../../../scenery/js/util/TPaint.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type FixedCircuitElementNode from './FixedCircuitElementNode.js';

// constants
const CORNER_RADIUS = 8; // in view coordinates

export default class FixedCircuitElementHighlightNode extends Rectangle {

  public constructor( fixedCircuitElementNode: FixedCircuitElementNode, color: TPaint, private readonly dilation: number ) {

    super( 0, 0, 0, 0,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: color,
        lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
        pickable: false
      } );

    this.recomputeBounds( fixedCircuitElementNode );
  }

  /**
   * Update the dimensions of the highlight, called on startup and when components change from lifelike/schematic.
   */
  public recomputeBounds( fixedCircuitElementNode: FixedCircuitElementNode ): void {

    // This is called rarely and hence the extra allocation is OK
    this.setRectBounds( fixedCircuitElementNode.getHighlightBounds().dilated( this.dilation ) );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementHighlightNode', FixedCircuitElementHighlightNode );