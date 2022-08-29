// Copyright 2020-2022, University of Colorado Boulder

/**
 * Shows contents for controls that change simulation representation or behavior.
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

export default class CCKCGeneralPreferencesContentNode extends VBox {
  private readonly disposeCCKCGeneralPreferencesContentNode: () => void;

  public constructor( tandem: Tandem ) {

    const textOptions = PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS;
    const schematicStandardRadioButtonGroup = new VerticalAquaRadioButtonGroup<SchematicType>( schematicTypeProperty, [ {
      node: new Text( circuitConstructionKitCommonStrings.ieeeStringProperty, textOptions ),
      value: SchematicType.IEEE,
      tandemName: 'ieeeRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.iecStringProperty, textOptions ),
      value: SchematicType.IEC,
      tandemName: 'iecRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.britishStringProperty, textOptions ),
      value: SchematicType.BRITISH,
      tandemName: 'britishRadioButton'
    } ], {
      tandem: tandem.createTandem( 'schematicTypeRadioButtonGroup' ),
      radioButtonOptions: {
        radius: 8
      }
    } );

    const ammeterReadoutRadioButtonGroup = new VerticalAquaRadioButtonGroup<AmmeterReadoutType>( ammeterReadoutTypeProperty, [ {
      node: new Text( circuitConstructionKitCommonStrings.magnitudeStringProperty, textOptions ),
      value: AmmeterReadoutType.MAGNITUDE,
      tandemName: 'magnitudeRadioButton'
    }, {
      node: new Text( circuitConstructionKitCommonStrings.signedStringProperty, textOptions ),
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
        new Text( circuitConstructionKitCommonStrings.schematicStandardStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        schematicStandardRadioButtonGroup,
        new HSeparator( 200 ),
        new Text( circuitConstructionKitCommonStrings.ammeterReadoutStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        ammeterReadoutRadioButtonGroup
      ]
    } );

    this.disposeCCKCGeneralPreferencesContentNode = () => {
      schematicStandardRadioButtonGroup.dispose();
      ammeterReadoutRadioButtonGroup.dispose();
    };
  }

  public override dispose(): void {
    this.disposeCCKCGeneralPreferencesContentNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'CCKCGeneralPreferencesContentNode', CCKCGeneralPreferencesContentNode );