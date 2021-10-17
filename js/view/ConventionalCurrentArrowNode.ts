// Copyright 2017-2020, University of Colorado Boulder

/**
 * Renders a red arrow with a white outline which depicts the conventional current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const ARROW_LENGTH = 23; // length of the arrow in view coordinates

class ConventionalCurrentArrowNode extends ArrowNode {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem: Tandem ) {

    super( 0, 0, ARROW_LENGTH, 0, {
      headHeight: 10,
      headWidth: 12,
      tailWidth: 3,
      fill: Color.RED,
      stroke: Color.WHITE,
      tandem: tandem
    } );

    const center = this.center;
    this.translate( -center.x, -center.y );
  }
}

circuitConstructionKitCommon.register( 'ConventionalCurrentArrowNode', ConventionalCurrentArrowNode );
export default ConventionalCurrentArrowNode;