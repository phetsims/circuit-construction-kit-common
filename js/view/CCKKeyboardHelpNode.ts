// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard help content shared by Circuit Construction Kit screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TwoColumnKeyboardHelpContent from '../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';

export default class CCKKeyboardHelpNode extends TwoColumnKeyboardHelpContent {

  public constructor() {

    const addElementsSection = new KeyboardHelpSection( CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.addElements.headingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.addElements.createElement.labelStringProperty,
        KeyboardHelpIconFactory.spaceOrEnter(), {
          labelInnerContent: CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.addElements.createElement.labelInnerContentStringProperty
        }
      )
    ] );

    const connectElementsSection = new KeyboardHelpSection( CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.headingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.grabJunction.labelStringProperty,
        KeyboardHelpIconFactory.spaceOrEnter(), {
          labelInnerContent: CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.grabJunction.labelInnerContentStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.selectTarget.labelStringProperty,
        KeyboardHelpIconFactory.arrowKeysRowIcon(), {
          labelInnerContent: CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.selectTarget.labelInnerContentStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.attachJunction.labelStringProperty,
        KeyboardHelpIconFactory.spaceOrEnter(), {
          labelInnerContent: CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.connectElements.attachJunction.labelInnerContentStringProperty
        }
      )
    ] );

    const basicActionsSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    super( [ addElementsSection, connectElementsSection ], [ basicActionsSection ] );
  }
}

circuitConstructionKitCommon.register( 'CCKKeyboardHelpNode', CCKKeyboardHelpNode );
