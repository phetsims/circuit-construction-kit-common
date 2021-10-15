// Copyright 2021, University of Colorado Boulder

/**
 * Checkbox styled for CCK
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Checkbox from '../../../sun/js/Checkbox.js';
// TODO: enable lint
import Node from '../../../scenery/js/nodes/Node.js'; // eslint-disable-line
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BOX_WIDTH = 16;

class CCKCCheckbox extends Checkbox {

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   */
  constructor( content, property, options ) {

    options = merge( { boxWidth: BOX_WIDTH }, options );
    super( content, property, options );
  }
}

circuitConstructionKitCommon.register( 'CCKCCheckbox', CCKCCheckbox );
export default CCKCCheckbox;