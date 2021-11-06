// Copyright 2020-2021, University of Colorado Boulder

/**
 * Shows the contents for the options dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import SchematicType from './SchematicType.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';

class CCKCOptionsDialogContent extends VBox {
  private readonly disposeCCKCOptionsDialogContent: () => void;

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem: Tandem ) {

    const textOptions = {
      fontSize: 23
    };
    const schematicStandardRadioButtonGroup = new VerticalAquaRadioButtonGroup<SchematicType>( schematicTypeProperty, [ {
      node: new Text( circuitConstructionKitCommonStrings.ieee, textOptions ) as unknown as Node,
      value: 'ieee',
      tandemName: 'ieeeRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.iec, textOptions ) as unknown as Node,
      value: 'iec',
      tandemName: 'iecRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.british, textOptions ) as unknown as Node,
      value: 'british',
      tandemName: 'britishRadioButton'
    } ], {
      tandem: tandem.createTandem( 'schematicTypeRadioButtonGroup' ),
      radioButtonOptions: {
        radius: 9
      }
    } );

    const ammeterReadoutRadioButtonGroup = new VerticalAquaRadioButtonGroup<AmmeterReadoutType>( ammeterReadoutTypeProperty, [ {
      node: new Text( circuitConstructionKitCommonStrings.magnitude, textOptions ) as unknown as Node,
      value: 'magnitude',
      tandemName: 'magnitudeRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.signed, textOptions ) as unknown as Node,
      value: 'signed',
      tandemName: 'signedRadioButton'
    } ], {
      tandem: tandem.createTandem( 'ammeterReadoutRadioButtonGroup' ),
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
        schematicStandardRadioButtonGroup,
        new HSeparator( 200 ),
        new Text( circuitConstructionKitCommonStrings.ammeterReadout, textOptions ),
        ammeterReadoutRadioButtonGroup
      ]
    } );

    // @private {function}
    this.disposeCCKCOptionsDialogContent = () => schematicStandardRadioButtonGroup.dispose();
  }

  // @public
  dispose() {
    this.disposeCCKCOptionsDialogContent();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CCKCOptionsDialogContent', CCKCOptionsDialogContent );
export default CCKCOptionsDialogContent;