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
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
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
      tandem: schematicStandardPreferencesControlTandem.createTandem( 'radioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false,
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
      tandem: ammeterReadoutPreferencesControlTandem.createTandem( 'radioButtonGroup' ),
      phetioVisiblePropertyInstrumented: false,
      radioButtonOptions: {
        radius: 8
      }
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
            new Text( CircuitConstructionKitCommonStrings.schematicStandardStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS ),
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
            new Text( CircuitConstructionKitCommonStrings.ammeterReadoutStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS ),
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