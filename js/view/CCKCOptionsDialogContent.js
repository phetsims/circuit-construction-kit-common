// Copyright 2020, University of Colorado Boulder

import Text from '../../../scenery/js/nodes/Text.js';
import Node from '../../../scenery/js/nodes/Node.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import SchematicType from './SchematicType.js';
import schematicTypeProperty from './schematicTypeProperty.js';

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

class CCKCOptionsDialogContent extends Node {
  constructor() {
    super();
    this.addChild( new VerticalAquaRadioButtonGroup( schematicTypeProperty, [
      { node: new Text( 'IEEE' ), value: SchematicType.IEEE },
      { node: new Text( 'IEC' ), value: SchematicType.IEC }
    ] ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCOptionsDialogContent', CCKCOptionsDialogContent );
export default CCKCOptionsDialogContent;