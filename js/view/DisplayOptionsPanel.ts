// Copyright 2016-2023, University of Colorado Boulder

/**
 * This control panel shows checkboxes for "Show Electrons", etc.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ElectronChargeNode from '../../../scenery-phet/js/ElectronChargeNode.js';
import { AlignBox, AlignGroup, HBox, Text, VBox, Node } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCCheckbox from './CCKCCheckbox.js';
import CCKCPanel from './CCKCPanel.js';
import ConventionalCurrentArrowNode from './ConventionalCurrentArrowNode.js';
import Property from '../../../axon/js/Property.js';
import Stopwatch from '../../../scenery-phet/js/Stopwatch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CurrentType from '../model/CurrentType.js';
import VerticalAquaRadioButtonGroup from '../../../sun/js/VerticalAquaRadioButtonGroup.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import CCKCColors from './CCKCColors.js';

const conventionalStringProperty = CircuitConstructionKitCommonStrings.conventionalStringProperty;
const electronsStringProperty = CircuitConstructionKitCommonStrings.electronsStringProperty;
const labelsStringProperty = CircuitConstructionKitCommonStrings.labelsStringProperty;
const showCurrentStringProperty = CircuitConstructionKitCommonStrings.showCurrentStringProperty;
const stopwatchStringProperty = CircuitConstructionKitCommonStrings.stopwatchStringProperty;
const valuesStringProperty = CircuitConstructionKitCommonStrings.valuesStringProperty;

// constants
const BOX_ALIGNMENT = { xAlign: 'left' as const };
const SPACING = 10;
const LEFT_MARGIN = 30;

export default class DisplayOptionsPanel extends CCKCPanel {

  // So the stopwatch can be shown near the checkbox
  public readonly stopwatchCheckbox: CCKCCheckbox | null;

  /**
   * @param alignGroup - box for aligning with other controls
   * @param showCurrentProperty - true if current should be shown
   * @param currentTypeProperty - true if current should be shown as electrons or conventional
   * @param showValuesProperty - true if values should be shown
   * @param showLabelsProperty - true if toolbox labels should be shown
   * @param stopwatch
   * @param showStopwatchCheckbox - true if stopwatch should be shown
   * @param tandem
   */
  public constructor( alignGroup: AlignGroup, showCurrentProperty: Property<boolean>, currentTypeProperty: Property<CurrentType>, showValuesProperty: Property<boolean>, showLabelsProperty: Property<boolean>,
                      stopwatch: Stopwatch, showStopwatchCheckbox: boolean, tandem: Tandem ) {

    const textIconSpacing = 11;

    // Align the Electrons/Conventional text and radio buttons
    const currentTypeRadioButtonLabelGroup = new AlignGroup();

    // Create an instrumented label
    const createLabel = ( stringProperty: TReadOnlyProperty<string>, parentTandem: Tandem ) => new Text( stringProperty, {
      tandem: parentTandem.createTandem( 'labelText' ),
      fontSize: CCKCConstants.FONT_SIZE,
      maxWidth: 120,
      fill: CCKCColors.textFillProperty
    } );

    const currentTypeRadioButtonGroupTandem = tandem.createTandem( 'currentTypeRadioButtonGroup' );

    const ELECTRONS_RADIO_BUTTON_TANDEM = 'electronsRadioButton';
    const CONVENTIONAL_RADIO_BUTTON_TANDEM = 'conventionalRadioButton';

    const electronsBox = new HBox( {
      children: [
        currentTypeRadioButtonLabelGroup.createBox( createLabel( electronsStringProperty, currentTypeRadioButtonGroupTandem.createTandem( ELECTRONS_RADIO_BUTTON_TANDEM ) ), BOX_ALIGNMENT ),

        // Match the size to the play area electrons, see https://github.com/phetsims/circuit-construction-kit-dc/issues/154
        new ElectronChargeNode( { scale: 0.75 } )
      ],
      spacing: textIconSpacing
    } );

    const conventionalBox = new HBox( {
      children: [
        currentTypeRadioButtonLabelGroup.createBox( createLabel( conventionalStringProperty, currentTypeRadioButtonGroupTandem.createTandem( CONVENTIONAL_RADIO_BUTTON_TANDEM ) ), BOX_ALIGNMENT ),
        new ConventionalCurrentArrowNode( Tandem.OPT_OUT )
      ],
      spacing: textIconSpacing
    } );

    const currentTypeRadioButtonGroup = new VerticalAquaRadioButtonGroup<CurrentType>( currentTypeProperty, [ {
      value: CurrentType.ELECTRONS,
      createNode: () => electronsBox,
      tandemName: ELECTRONS_RADIO_BUTTON_TANDEM
    }, {
      value: CurrentType.CONVENTIONAL,
      createNode: () => conventionalBox,
      tandemName: CONVENTIONAL_RADIO_BUTTON_TANDEM
    }
    ], {
      tandem: currentTypeRadioButtonGroupTandem,
      spacing: 6
    } );

    // AlignBox necessary to indent the children radio buttons
    const currentTypeRadioButtonGroupContainer = new AlignBox(
      currentTypeRadioButtonGroup, {
        tandem: Tandem.OPT_OUT,
        leftMargin: LEFT_MARGIN
      }
    );

    // Gray out current view options when current is not selected.
    showCurrentProperty.linkAttribute( currentTypeRadioButtonGroup, 'enabled' );

    const labelsCheckboxTandem = tandem.createTandem( 'labelsCheckbox' );
    const showLabelsCheckbox = new CCKCCheckbox( showLabelsProperty, createLabel( labelsStringProperty, labelsCheckboxTandem ), {
      tandem: labelsCheckboxTandem
    } );
    const valuesCheckboxTandem = tandem.createTandem( 'valuesCheckbox' );
    const showValuesCheckbox = new CCKCCheckbox( showValuesProperty, createLabel( valuesStringProperty, valuesCheckboxTandem ), {
      tandem: valuesCheckboxTandem
    } );

    let stopwatchCheckbox = null;
    if ( showStopwatchCheckbox ) {
      const stopwatchCheckboxTandem = tandem.createTandem( 'stopwatchCheckbox' );
      stopwatchCheckbox = new CCKCCheckbox( stopwatch.isVisibleProperty, createLabel( stopwatchStringProperty, stopwatchCheckboxTandem ), {
        tandem: stopwatchCheckboxTandem
      } );
    }

    const showCurrentCheckboxTandem = tandem.createTandem( 'showCurrentCheckbox' );
    const children = [

      // Show Current and sub-checkboxes
      new VBox( {
        align: 'left',
        spacing: 8,
        children: [
          new CCKCCheckbox( showCurrentProperty, createLabel( showCurrentStringProperty, showCurrentCheckboxTandem ), {
            tandem: showCurrentCheckboxTandem
          } ),
          currentTypeRadioButtonGroupContainer
        ]
      } ),
      showLabelsCheckbox,
      showValuesCheckbox,
      ...( showStopwatchCheckbox ? [ stopwatchCheckbox! ] : [] )
    ];

    // Align with neighboring controls, unless empty. Then OK to let the Panel collapse.
    const vBox = new VBox( {
      children: children,
      spacing: SPACING,
      align: 'left'
    } );
    const alignBox = alignGroup.createBox( vBox, { xAlign: 'left' } );
    const content = new Node( { excludeInvisibleChildrenFromBounds: true } );
    vBox.boundsProperty.link( bounds => content.setChildren( bounds.isValid() ? [ alignBox ] : [] ) );

    super( content, tandem, {
      yMargin: 10,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    // Touch & Mouse area extends to the right across the control panel
    showLabelsCheckbox.touchArea = showLabelsCheckbox.localBounds.dilatedXY( 5, SPACING / 2 ).withMaxX( this.bounds.width - LEFT_MARGIN );
    showLabelsCheckbox.mouseArea = showLabelsCheckbox.touchArea;

    showValuesCheckbox.touchArea = showValuesCheckbox.localBounds.dilatedXY( 5, SPACING / 2 ).withMaxX( this.bounds.width - LEFT_MARGIN );
    showValuesCheckbox.mouseArea = showValuesCheckbox.touchArea;

    if ( showStopwatchCheckbox && stopwatchCheckbox ) {
      stopwatchCheckbox.touchArea = stopwatchCheckbox.localBounds.dilatedXY( 5, SPACING / 2 ).withMaxX( this.bounds.width - LEFT_MARGIN );
      stopwatchCheckbox.mouseArea = stopwatchCheckbox.touchArea;
    }

    this.stopwatchCheckbox = stopwatchCheckbox;
  }
}

circuitConstructionKitCommon.register( 'DisplayOptionsPanel', DisplayOptionsPanel );