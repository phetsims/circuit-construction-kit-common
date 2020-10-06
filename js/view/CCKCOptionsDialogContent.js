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
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import SchematicType from './SchematicType.js';
import schematicTypeProperty from './schematicTypeProperty.js';

class CCKCOptionsDialogContent extends VBox {
  constructor( tandem ) {

    const textOptions = {
      fontSize: 23
    };
    const verticalAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( schematicTypeProperty, [
      { node: new Text( circuitConstructionKitCommonStrings.ieee, textOptions ), value: SchematicType.IEEE, tandemName: 'ieeeRadioButton' },
      { node: new Text( circuitConstructionKitCommonStrings.iec, textOptions ), value: SchematicType.IEC, tandemName: 'iecRadioButton' }
    ], {
      tandem: tandem.createTandem( 'schematicTypeRadioButtonGroup' ),
      radioButtonOptions: {
        radius: 9
      }
    } );
    super( {
      align: 'left',
      spacing: 22,
      tandem: tandem,
      children: [
        new Text( circuitConstructionKitCommonStrings.schematicStandard, textOptions ),
        verticalAquaRadioButtonGroup ]
    } );

    this.disposeCCKCOptionsDialogContent = () => {
      verticalAquaRadioButtonGroup.dispose();
    };
  }

  // @public
  dispose() {
    this.disposeCCKCOptionsDialogContent();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CCKCOptionsDialogContent', CCKCOptionsDialogContent );
export default CCKCOptionsDialogContent;