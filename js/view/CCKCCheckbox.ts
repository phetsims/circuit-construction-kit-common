// Copyright 2021, University of Colorado Boulder

/**
 * Checkbox styled for CCK
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Checkbox, { CheckboxOptions } from '../../../sun/js/Checkbox.js';
import { Node } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Property from '../../../axon/js/Property.js';

// constants
const BOX_WIDTH = 16;

class CCKCCheckbox extends Checkbox {

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [providedOptions]
   */
  constructor( content: Node, property: Property<boolean>, providedOptions?: Partial<CheckboxOptions> ) {

    providedOptions = merge( { boxWidth: BOX_WIDTH }, providedOptions );
    super( content, property, providedOptions );
  }
}

circuitConstructionKitCommon.register( 'CCKCCheckbox', CCKCCheckbox );
export default CCKCCheckbox;