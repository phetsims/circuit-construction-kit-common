// Copyright 2017-2023, University of Colorado Boulder

/**
 * Renders a red arrow with a white outline which depicts the conventional current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCColors from './CCKCColors.js';

// constants
const ARROW_LENGTH = 23; // length of the arrow in view coordinates

export default class ConventionalCurrentArrowNode extends ArrowNode {

  public constructor( tandem: Tandem ) {

    super( 0, 0, ARROW_LENGTH, 0, {
      headHeight: 10,
      headWidth: 12,
      tailWidth: 3,
      fill: CCKCColors.conventionalCurrentArrowFillProperty,
      stroke: CCKCColors.conventionalCurrentArrowStrokeProperty,
      tandem: tandem
    } );

    const center = this.center;
    this.translate( -center.x, -center.y );
  }
}

circuitConstructionKitCommon.register( 'ConventionalCurrentArrowNode', ConventionalCurrentArrowNode );