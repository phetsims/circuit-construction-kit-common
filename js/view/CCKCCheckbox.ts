// Copyright 2021, University of Colorado Boulder

/**
 * Checkbox styled for CCK
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Property from '../../../axon/js/Property.js';

// constants
const BOX_WIDTH = 16;

class CCKCCheckbox extends Checkbox {

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   */
  constructor( content: Node, property: Property<boolean>, options?: Partial<CheckboxOptions> ) {

    options = merge( { boxWidth: BOX_WIDTH }, options );
    super( content, property, options );
  }
}

circuitConstructionKitCommon.register( 'CCKCCheckbox', CCKCCheckbox );
export default CCKCCheckbox;