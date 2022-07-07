// Copyright 2021-2022, University of Colorado Boulder

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

export default class CCKCCheckbox extends Checkbox {

  public constructor( property: Property<boolean>, content: Node, providedOptions?: Partial<CheckboxOptions> ) {

    providedOptions = merge( { boxWidth: BOX_WIDTH }, providedOptions );
    super( property, content, providedOptions );
  }
}

circuitConstructionKitCommon.register( 'CCKCCheckbox', CCKCCheckbox );