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

    // Remove from toolbox [Space] or [Enter]
    const removeFromToolboxRow = KeyboardHelpSectionRow.labelWithIcon(
      CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.removeFromToolboxStringProperty,
      KeyboardHelpIconFactory.spaceOrEnter(), {
        labelInnerContent: CircuitConstructionKitCommonFluent.a11y.keyboardHelpDialog.circuitComponentsAndTools.removeFromToolboxDescription.createProperty( {
          enterOrReturn: TextKeyNode.getEnterKeyString()
        } )
      }
    );

    // Return to toolbox [Delete] or [Backspace]
    const deleteOrBackspaceIcon1 = KeyboardHelpIconFactory.iconOrIcon( TextKeyNode.delete(), TextKeyNode.backspace() );
    const returnToToolboxRow = KeyboardHelpSectionRow.labelWithIcon(
      CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.returnToToolboxStringProperty,
      deleteOrBackspaceIcon1, {
        labelInnerContent: CircuitConstructionKitCommonFluent.a11y.keyboardHelpDialog.circuitComponentsAndTools.returnToToolboxDescriptionStringProperty
      }
    );

    // Edit component [Space] or [Enter]
    const editComponentRow = KeyboardHelpSectionRow.labelWithIcon(
      CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.editComponentStringProperty,
      KeyboardHelpIconFactory.spaceOrEnter(), {
        labelInnerContent: CircuitConstructionKitCommonFluent.a11y.keyboardHelpDialog.circuitComponentsAndTools.editComponentDescription.createProperty( {
          enterOrReturn: TextKeyNode.getEnterKeyString()
        } )
      }
    );

    // Cut connections [Delete] or [Backspace]
    const deleteOrBackspaceIcon2 = KeyboardHelpIconFactory.iconOrIcon( TextKeyNode.delete(), TextKeyNode.backspace() );
    const cutConnectionsRow = KeyboardHelpSectionRow.labelWithIcon(
      CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.cutConnectionsStringProperty,
      deleteOrBackspaceIcon2, {
        labelInnerContent: CircuitConstructionKitCommonFluent.a11y.keyboardHelpDialog.circuitComponentsAndTools.cutConnectionsDescriptionStringProperty
      }
    );

    super( CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.headingStringProperty, [
      removeFromToolboxRow,
      returnToToolboxRow,
      editComponentRow,
      cutConnectionsRow
    ] );
  }
}

circuitConstructionKitCommon.register( 'CircuitComponentsAndToolsKeyboardHelpSection', CircuitComponentsAndToolsKeyboardHelpSection );
