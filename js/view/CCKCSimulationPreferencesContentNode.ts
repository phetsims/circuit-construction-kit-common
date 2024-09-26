// Copyright 2020-2024, University of Colorado Boulder

/**
 * Shows contents for controls that change simulation representation or behavior.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { HSeparator, Text, VBox } from '../../../scenery/js/imports.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import SchematicType from './SchematicType.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import PreferencesDialog from '../../../joist/js/preferences/PreferencesDialog.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import PreferencesControl from '../../../joist/js/preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../../../joist/js/preferences/PreferencesDialogConstants.js';
import measuringDeviceNoiseProperty from '../model/measuringDeviceNoiseProperty.js';
import circuitElementNoiseProperty from '../model/circuitElementNoiseProperty.js';
import highPrecisionMetersProperty from '../model/highPrecisionMetersProperty.js';

export default class CCKCSimulationPreferencesContentNode extends VBox {

  public constructor( tandem: Tandem ) {

    const textOptions = PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS;
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

    const circuitElementNoiseControl = new PreferencesControl( {
      tandem: tandem.createTandem( 'circuitElementNoiseControl' ),
      labelNode: new Text( CircuitConstructionKitCommonStrings.circuitElementNoiseStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      controlNode: new ToggleSwitch( circuitElementNoiseProperty, false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    const highPrecisionMetersControl = new PreferencesControl( {
      tandem: tandem.createTandem( 'highPrecisionMetersControl' ),
      labelNode: new Text( CircuitConstructionKitCommonStrings.highPrecisionMetersStringProperty, PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      controlNode: new ToggleSwitch( highPrecisionMetersProperty, false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    super( {
      align: 'left',
      spacing: PreferencesDialog.CONTENT_SPACING,
      tandem: tandem,
      children: [
        new Text( CircuitConstructionKitCommonStrings.schematicStandardStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        schematicTypeRadioButtonGroup,
        new HSeparator(),
        new Text( CircuitConstructionKitCommonStrings.ammeterReadoutStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
        ammeterReadoutRadioButtonGroup,
        new HSeparator(),
        measuringDeviceNoiseControl,
        circuitElementNoiseControl,
        highPrecisionMetersControl
      ]
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCSimulationPreferencesContentNode', CCKCSimulationPreferencesContentNode );