// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard help section for explaining how to choose a junction connection.
 * Based on ComboBoxKeyboardHelpSection but with customized text for CCK's junction connection workflow.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import KeyboardHelpIconFactory from '../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import SceneryPhetStrings from '../../../scenery-phet/js/SceneryPhetStrings.js';
import TextKeyNode from '../../../scenery-phet/js/keyboard/TextKeyNode.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';

export default class ChooseJunctionConnectionKeyboardHelpSection extends KeyboardHelpSection {

  public constructor() {

    const thingAsLowerCasePluralStringProperty = CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.chooseConnection.thingPluralStringProperty;
    const thingAsLowerCaseSingularStringProperty = CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.chooseConnection.thingSingularStringProperty;

    // Create a PatternStringProperty that fills in a plural/singular pattern, and support dynamic locale.
    const createPatternStringProperty = ( providedStringProperty: typeof SceneryPhetStrings.keyboardHelpDialog.comboBox.popUpListPatternStringProperty ) => {
      return new PatternStringProperty(
        providedStringProperty, {
          thingPlural: thingAsLowerCasePluralStringProperty,
          thingSingular: thingAsLowerCaseSingularStringProperty
        }, { tandem: Tandem.OPT_OUT } );
    };

    const spaceKeyNode = TextKeyNode.space();
    const enterKeyNode = TextKeyNode.enter();
    const spaceOrEnterIcon = KeyboardHelpIconFactory.iconOrIcon( spaceKeyNode, enterKeyNode );

    const popUpList = KeyboardHelpSectionRow.labelWithIcon(
      createPatternStringProperty( SceneryPhetStrings.keyboardHelpDialog.comboBox.popUpListPatternStringProperty ),
      spaceOrEnterIcon, {
        labelInnerContent: new PatternStringProperty( SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.popUpListPatternDescriptionStringProperty, {
          thingPlural: thingAsLowerCasePluralStringProperty,
          enterOrReturn: TextKeyNode.getEnterKeyString()
        } )
      } );

    const moveThrough = KeyboardHelpSectionRow.labelWithIcon(
      createPatternStringProperty( SceneryPhetStrings.keyboardHelpDialog.comboBox.moveThroughPatternStringProperty ),
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
        labelInnerContent: createPatternStringProperty( SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.moveThroughPatternDescriptionStringProperty )
      } );

    const chooseNew = KeyboardHelpSectionRow.labelWithIcon(
      createPatternStringProperty( SceneryPhetStrings.keyboardHelpDialog.comboBox.chooseNewPatternStringProperty ),
      enterKeyNode, {
        labelInnerContent: new PatternStringProperty( SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.chooseNewPatternDescriptionStringProperty, {
          thingSingular: thingAsLowerCaseSingularStringProperty,
          enterOrReturn: TextKeyNode.getEnterKeyString()
        } )
      } );

    const escapeKeyNode = TextKeyNode.esc();
    const cancelConnection = KeyboardHelpSectionRow.labelWithIcon(
      CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.chooseConnection.cancelConnectionStringProperty,
      escapeKeyNode, {
        labelInnerContent: SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.closeWithoutChangingDescriptionStringProperty
      } );

    const rows = [ popUpList, moveThrough, chooseNew, cancelConnection ];

    super(
      CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.chooseConnection.headingStringProperty,
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
