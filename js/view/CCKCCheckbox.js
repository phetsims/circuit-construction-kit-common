// Copyright 2020, University of Colorado Boulder

import merge from '../../../phet-core/js/merge.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * Checkbox styled for CCK
 * @author Sam Reid (PhET Interactive Simulations)
 */

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