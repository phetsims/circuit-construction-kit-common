// Copyright 2020-2025, University of Colorado Boulder

/**
 * Shows contents for controls that change simulation representation or behavior.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PreferencesDialogConstants from '../../../joist/js/preferences/PreferencesDialogConstants.js';
import HSeparator from '../../../scenery/js/layout/nodes/HSeparator.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import SchematicType from './SchematicType.js';
import schematicTypeProperty from './schematicTypeProperty.js';

export default class CCKCSimulationPreferencesContentNode extends VBox {

  public constructor( tandem: Tandem ) {

    const schematicStandardPreferencesControlTandem = tandem.createTandem( 'schematicStandardPreferencesControl' );
    const ammeterReadoutPreferencesControlTandem = tandem.createTandem( 'ammeterReadoutPreferencesControl' );

    const textOptions = PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS;
    const schematicTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup<SchematicType>( schematicTypeProperty, [ {
      createNode: () => new Text( CircuitConstructionKitCommonFluent.ieeeStringProperty, textOptions ),
      value: SchematicType.IEEE,
      tandemName: 'ieeeRadioButton'
    }, {
      createNode: () => new Text( CircuitConstructionKitCommonFluent.iecStringProperty, textOptions ),
      value: SchematicType.IEC,
      tandemName: 'iecRadioButton'
    }, {
      createNode: () => new Text( CircuitConstructionKitCommonFluent.britishStringProperty, textOptions ),
      value: SchematicType.BRITISH,
      tandemName: 'britishRadioButton'
    } ], {
      tandem: schematicStandardPreferencesControlTandem.createTandem( 'radioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false,
      radioButtonOptions: {
        radius: 8
      },
      accessibleName: CircuitConstructionKitCommonFluent.a11y.simulationPreferences.schematicStandard.accessibleNameStringProperty,
      accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.simulationPreferences.schematicStandard.accessibleHelpTextStringProperty
    } );

    const ammeterReadoutRadioButtonGroup = new VerticalAquaRadioButtonGroup<AmmeterReadoutType>( ammeterReadoutTypeProperty, [ {
      createNode: () => new Text( CircuitConstructionKitCommonFluent.magnitudeStringProperty, textOptions ),
      value: AmmeterReadoutType.MAGNITUDE,
      tandemName: 'magnitudeRadioButton'
    }, {
      createNode: () => new Text( CircuitConstructionKitCommonFluent.signedStringProperty, textOptions ),
      value: AmmeterReadoutType.SIGNED,
      tandemName: 'signedRadioButton'
    } ], {
      tandem: ammeterReadoutPreferencesControlTandem.createTandem( 'radioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false,
      radioButtonOptions: {
        radius: 8
      },
      accessibleName: CircuitConstructionKitCommonFluent.a11y.simulationPreferences.ammeterReadout.accessibleNameStringProperty,
      accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.simulationPreferences.ammeterReadout.accessibleHelpTextStringProperty
    } );

    super( {
      align: 'left',
      spacing: PreferencesDialogConstants.CONTENT_SPACING,
      tandem: tandem,
      children: [
        new VBox( {
          align: 'left',
          spacing: PreferencesDialogConstants.CONTENT_SPACING,
          children: [
            new Text( CircuitConstructionKitCommonFluent.schematicStandardStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS ),
            schematicTypeRadioButtonGroup
          ],
          tandem: schematicStandardPreferencesControlTandem,
          visiblePropertyOptions: {
            phetioFeatured: true
          }
        } ),
        new HSeparator(),
        new VBox( {
          align: 'left',
          spacing: PreferencesDialogConstants.CONTENT_SPACING,
          children: [
            new Text( CircuitConstructionKitCommonFluent.ammeterReadoutStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS ),
            ammeterReadoutRadioButtonGroup
          ],
          tandem: ammeterReadoutPreferencesControlTandem,
          visiblePropertyOptions: {
            phetioFeatured: true
          }
        } )
      ]
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCSimulationPreferencesContentNode', CCKCSimulationPreferencesContentNode );