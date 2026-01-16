// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard help section for Circuit Components and Measurement Tools.
 * Describes how to add/remove components from the toolbox and edit circuit elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import KeyboardHelpIconFactory from '../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TextKeyNode from '../../../scenery-phet/js/keyboard/TextKeyNode.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';

export default class CircuitComponentsAndToolsKeyboardHelpSection extends KeyboardHelpSection {

  public constructor() {

    const strings = CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools;
    const a11yStrings = CircuitConstructionKitCommonFluent.a11y.keyboardHelpDialog.circuitComponentsAndTools;

    // Remove from toolbox [Space] or [Enter]
    const removeFromToolboxRow = KeyboardHelpSectionRow.labelWithIcon(
      strings.removeFromToolboxStringProperty,
      KeyboardHelpIconFactory.spaceOrEnter(), {
        labelInnerContent: a11yStrings.removeFromToolboxDescriptionStringProperty
      }
    );

    // Return to toolbox [Delete] or [Backspace]
    const deleteOrBackspaceIcon1 = KeyboardHelpIconFactory.iconOrIcon( TextKeyNode.delete(), TextKeyNode.backspace() );
    const returnToToolboxRow = KeyboardHelpSectionRow.labelWithIcon(
      strings.returnToToolboxStringProperty,
      deleteOrBackspaceIcon1, {
        labelInnerContent: a11yStrings.returnToToolboxDescriptionStringProperty
      }
    );

    // Edit component [Space] or [Enter]
    const editComponentRow = KeyboardHelpSectionRow.labelWithIcon(
      strings.editComponentStringProperty,
      KeyboardHelpIconFactory.spaceOrEnter(), {
        labelInnerContent: a11yStrings.editComponentDescriptionStringProperty
      }
    );

    // Cut connections [Delete] or [Backspace]
    const deleteOrBackspaceIcon2 = KeyboardHelpIconFactory.iconOrIcon( TextKeyNode.delete(), TextKeyNode.backspace() );
    const cutConnectionsRow = KeyboardHelpSectionRow.labelWithIcon(
      strings.cutConnectionsStringProperty,
      deleteOrBackspaceIcon2, {
        labelInnerContent: a11yStrings.cutConnectionsDescriptionStringProperty
      }
    );

    super( strings.headingStringProperty, [
      removeFromToolboxRow,
      returnToToolboxRow,
      editComponentRow,
      cutConnectionsRow
    ] );
  }
}

circuitConstructionKitCommon.register( 'CircuitComponentsAndToolsKeyboardHelpSection', CircuitComponentsAndToolsKeyboardHelpSection );
