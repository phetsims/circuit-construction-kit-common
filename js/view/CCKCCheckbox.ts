// Copyright 2021-2025, University of Colorado Boulder

/**
 * Checkbox styled for CCK
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Checkbox, { type CheckboxOptions } from '../../../sun/js/Checkbox.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BOX_WIDTH = 16;

export default class CCKCCheckbox extends Checkbox {

  public constructor( property: Property<boolean>, content: Node, providedOptions?: CheckboxOptions ) {

    providedOptions = combineOptions<CheckboxOptions>( { boxWidth: BOX_WIDTH }, providedOptions );
    super( property, content, providedOptions );
  }
}

circuitConstructionKitCommon.register( 'CCKCCheckbox', CCKCCheckbox );