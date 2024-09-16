// Copyright 2020-2025, University of Colorado Boulder

import PreferencesDialogConstants from '../../../joist/js/preferences/PreferencesDialogConstants.js';
/**
 * Shows contents for controls that change simulation representation or behavior.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import HSeparator from '../../../scenery/js/layout/nodes/HSeparator.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import PreferencesControl from '../../../joist/js/preferences/PreferencesControl.js';
import SchematicType from './SchematicType.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import measuringDeviceNoiseProperty from '../model/measuringDeviceNoiseProperty.js';

export default class CCKCSimulationPreferencesContentNode extends VBox {

  public constructor( tandem: Tandem ) {

    const textOptions = PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS;
    const schematicTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup<SchematicType>( schematicTypeProperty, [ {
      createNode: () => new Text( CircuitConstructionKitCommonStrings.ieeeStringProperty, textOptions ),
      value: SchematicType.IEEE,
      tandemName: 'ieeeRadioButton'
    }, {
      createNode: () => new Text( CircuitConstructionKitCommonStrings.iecStringProperty, textOptions ),
      value: SchematicType.IEC,
      tandemName: 'iecRadioButton'
    }, {
      createNode: () => new Text( CircuitConstructionKitCommonStrings.britishStringProperty, textOptions ),
      value: SchematicType.BRITISH,
      tandemName: 'britishRadioButton'
    } ], {
      tandem: tandem.createTandem( 'schematicTypeRadioButtonGroup' ),
      radioButtonOptions: {
        radius: 8
      }
    } );

    const ammeterReadoutRadioButtonGroup = new VerticalAquaRadioButtonGroup<AmmeterReadoutType>( ammeterReadoutTypeProperty, [ {
      createNode: () => new Text( CircuitConstructionKitCommonStrings.magnitudeStringProperty, textOptions ),
      value: AmmeterReadoutType.MAGNITUDE,
      tandemName: 'magnitudeRadioButton'
    }, {
      createNode: () => new Text( CircuitConstructionKitCommonStrings.signedStringProperty, textOptions ),
      value: AmmeterReadoutType.SIGNED,
      tandemName: 'signedRadioButton'
    } ], {
      tandem: tandem.createTandem( 'ammeterReadoutRadioButtonGroup' ),
      radioButtonOptions: {
        radius: 8
      }
    } );

    const measuringDeviceNoiseControl = new PreferencesControl( {
      tandem: tandem.createTandem( 'measuringDeviceNoiseControl' ),
      labelNode: new Text( CircuitConstructionKitCommonStrings.measuringDeviceNoiseStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      controlNode: new ToggleSwitch( measuringDeviceNoiseProperty, false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    super( {
      align: 'left',
      spacing: PreferencesDialogConstants.CONTENT_SPACING,
      tandem: tandem,
      children: [
        new Text( CircuitConstructionKitCommonStrings.schematicStandardStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS ),
        schematicTypeRadioButtonGroup,
        new HSeparator(),
        new Text( CircuitConstructionKitCommonStrings.ammeterReadoutStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS ),
        ammeterReadoutRadioButtonGroup,
        new HSeparator(),
        measuringDeviceNoiseControl
      ]
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCSimulationPreferencesContentNode', CCKCSimulationPreferencesContentNode );