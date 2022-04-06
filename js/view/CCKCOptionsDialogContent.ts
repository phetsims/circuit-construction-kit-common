// Copyright 2020-2022, University of Colorado Boulder

/**
 * Shows the contents for the options dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { Text } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import SchematicType from './SchematicType.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';

export default class CCKCOptionsDialogContent extends VBox {
  private readonly disposeCCKCOptionsDialogContent: () => void;

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem: Tandem ) {

    const textOptions = {
      fontSize: 23
    };
    const schematicStandardRadioButtonGroup = new VerticalAquaRadioButtonGroup<SchematicType>( schematicTypeProperty, [ {
      node: new Text( circuitConstructionKitCommonStrings.ieee, textOptions ),
      value: SchematicType.IEEE,
      tandemName: 'ieeeRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.iec, textOptions ),
      value: SchematicType.IEC,
      tandemName: 'iecRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.british, textOptions ),
      value: SchematicType.BRITISH,
      tandemName: 'britishRadioButton'
    } ], {
      tandem: tandem.createTandem( 'schematicTypeRadioButtonGroup' ),
      radioButtonOptions: {
        radius: 9
      }
    } );

    const ammeterReadoutRadioButtonGroup = new VerticalAquaRadioButtonGroup<AmmeterReadoutType>( ammeterReadoutTypeProperty, [ {
      node: new Text( circuitConstructionKitCommonStrings.magnitude, textOptions ),
      value: AmmeterReadoutType.MAGNITUDE,
      tandemName: 'magnitudeRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.signed, textOptions ),
      value: AmmeterReadoutType.SIGNED,
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

    this.disposeCCKCOptionsDialogContent = () => schematicStandardRadioButtonGroup.dispose();
  }

  override dispose(): void {
    this.disposeCCKCOptionsDialogContent();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CCKCOptionsDialogContent', CCKCOptionsDialogContent );