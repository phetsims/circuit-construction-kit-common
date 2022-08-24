// Copyright 2020-2022, University of Colorado Boulder

/**
 * Shows the contents for the options dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { Text, VBox } from '../../../scenery/js/imports.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import SchematicType from './SchematicType.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import PreferencesDialog from '../../../joist/js/preferences/PreferencesDialog.js';

export default class CCKCOptionsDialogContent extends VBox {
  private readonly disposeCCKCOptionsDialogContent: () => void;

  public constructor( tandem: Tandem ) {

    const textOptions = PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS;
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
        radius: 8
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
        radius: 8
      }
    } );

    super( {
      align: 'left',
      spacing: PreferencesDialog.CONTENT_SPACING,
      tandem: tandem,
      children: [
        new Text( circuitConstructionKitCommonStrings.schematicStandard, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        schematicStandardRadioButtonGroup,
        new HSeparator( 200 ),
        new Text( circuitConstructionKitCommonStrings.ammeterReadout, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        ammeterReadoutRadioButtonGroup
      ]
    } );

    this.disposeCCKCOptionsDialogContent = () => schematicStandardRadioButtonGroup.dispose();
  }

  public override dispose(): void {
    this.disposeCCKCOptionsDialogContent();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CCKCOptionsDialogContent', CCKCOptionsDialogContent );