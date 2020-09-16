// Copyright 2020, University of Colorado Boulder

/**
 * Shows the contents for the options dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import SchematicType from './SchematicType.js';
import schematicTypeProperty from './schematicTypeProperty.js';

class CCKCOptionsDialogContent extends VBox {
  constructor() {

    const textOptions = {
      fontSize: 23
    };
    super( {
      align: 'left',
      spacing: 22,
      children: [
        new Text( 'Electronic Symbol Standard', textOptions ),
        new VerticalAquaRadioButtonGroup( schematicTypeProperty, [
          { node: new Text( 'IEEE', textOptions ), value: SchematicType.IEEE },
          { node: new Text( 'IEC', textOptions ), value: SchematicType.IEC }
        ], {
          radioButtonOptions: {
            radius: 9
          }
        } ) ]
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCOptionsDialogContent', CCKCOptionsDialogContent );
export default CCKCOptionsDialogContent;