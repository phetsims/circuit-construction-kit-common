// Copyright 2017-2023, University of Colorado Boulder

/**
 * Node used by FixedCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Rectangle } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import CCKCColors from './CCKCColors.js';

// constants
const CORNER_RADIUS = 8; // in view coordinates

export default class FixedCircuitElementHighlightNode extends Rectangle {

  public constructor( fixedCircuitElementNode: FixedCircuitElementNode ) {

    super( 0, 0, 0, 0,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: CCKCColors.highlightStrokeProperty,
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
    this.setRectBounds( fixedCircuitElementNode.getHighlightBounds() );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementHighlightNode', FixedCircuitElementHighlightNode );