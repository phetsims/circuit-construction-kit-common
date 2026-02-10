// Copyright 2025-2026, University of Colorado Boulder

/**
 * Keyboard help section for explaining how to choose a junction connection.
 * Based on ComboBoxKeyboardHelpSection but with customized text for CCK's junction connection workflow.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import HotkeyDescriptionBuilder from '../../../scenery-phet/js/keyboard/help/HotkeyDescriptionBuilder.js';
import KeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import SceneryPhetFluent from '../../../scenery-phet/js/SceneryPhetFluent.js';
import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import { OneKeyStroke } from '../../../scenery/js/input/KeyDescriptor.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';

export default class ChooseJunctionConnectionKeyboardHelpSection extends KeyboardHelpSection {

  public constructor() {

    const thingAsLowerCasePluralStringProperty = CircuitConstructionKitCommonFluent.keyboardHelpDialog.chooseConnection.thingPluralStringProperty;
    const thingAsLowerCaseSingularStringProperty = CircuitConstructionKitCommonFluent.keyboardHelpDialog.chooseConnection.thingSingularStringProperty;

    // Create a PatternStringProperty that fills in a plural/singular pattern, and support dynamic locale.
    const createPatternStringProperty = ( providedStringProperty: typeof SceneryPhetFluent.keyboardHelpDialog.comboBox.popUpListPatternStringProperty ) => {
      return new PatternStringProperty(
        providedStringProperty, {
          thingPlural: thingAsLowerCasePluralStringProperty,
          thingSingular: thingAsLowerCaseSingularStringProperty
        }, { tandem: Tandem.OPT_OUT } );
    };

    // Creates content for a row of help content for this section. The content uses HotkeyData, but
    // it is more complicated than usual. The visual label uses one string that includes a number
    // to indicate the order of steps. But the accessible label should not include that number because
    // it is implicit in the accessible markup ('ol'). The icons and accessible labels are still
    // created using HotkeyData.
    const createSectionRow = (
      keys: OneKeyStroke[],
      visualLabelStringProperty: TReadOnlyProperty<string>,
      accessibleLabelStringProperty: TReadOnlyProperty<string>
    ) => {

      const hotkeyData = new HotkeyData( {
        keys: keys,
        repoName: circuitConstructionKitCommon.name,
        keyboardHelpDialogLabelStringProperty: visualLabelStringProperty
      } );

      return KeyboardHelpSectionRow.fromHotkeyData( hotkeyData, {
        pdomLabelStringProperty: HotkeyDescriptionBuilder.createDescriptionProperty(
          accessibleLabelStringProperty,
          hotkeyData.keyDescriptorsProperty
        )
      } );
    };

    const popUpList = createSectionRow(
      [ 'space', 'enter' ],
      createPatternStringProperty( SceneryPhetFluent.keyboardHelpDialog.comboBox.popUpListPatternStringProperty ),
      createPatternStringProperty( SceneryPhetFluent.a11y.keyboardHelpDialog.comboBox.popUpListPatternStringProperty )
    );

    const moveThrough = createSectionRow(
      [ 'arrowUp', 'arrowDown' ],
      createPatternStringProperty( SceneryPhetFluent.keyboardHelpDialog.comboBox.moveThroughPatternStringProperty ),
      createPatternStringProperty( SceneryPhetFluent.a11y.keyboardHelpDialog.comboBox.moveThroughPatternStringProperty )
    );

    const chooseNew = createSectionRow(
      [ 'enter' ],
      createPatternStringProperty( SceneryPhetFluent.keyboardHelpDialog.comboBox.chooseNewPatternStringProperty ),
      createPatternStringProperty( SceneryPhetFluent.a11y.keyboardHelpDialog.comboBox.chooseNewPatternStringProperty )
    );

    const cancelConnection = createSectionRow(
      [ 'escape' ],
      CircuitConstructionKitCommonFluent.keyboardHelpDialog.chooseConnection.cancelConnectionStringProperty,
      CircuitConstructionKitCommonFluent.a11y.keyboardHelpDialog.cancelWithEscapeStringProperty
    );

    const rows = [ popUpList, moveThrough, chooseNew, cancelConnection ];

    super(
      CircuitConstructionKitCommonFluent.keyboardHelpDialog.chooseConnection.headingStringProperty,
      rows, {
        a11yContentTagName: 'ol',
        vBoxOptions: {
          spacing: 8
        }
      }
    );
  }
}

circuitConstructionKitCommon.register( 'ChooseJunctionConnectionKeyboardHelpSection', ChooseJunctionConnectionKeyboardHelpSection );
