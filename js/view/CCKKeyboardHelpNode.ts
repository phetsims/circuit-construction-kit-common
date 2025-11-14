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
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class CCKKeyboardHelpNode extends TwoColumnKeyboardHelpContent {

  public constructor() {

    const keyboardHelpStrings = CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog;
    const addElementsStrings = keyboardHelpStrings.addElements;
    const connectElementsStrings = keyboardHelpStrings.connectElements;

    const addElementsSection = new KeyboardHelpSection( addElementsStrings.headingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        addElementsStrings.createElement.labelStringProperty,
        KeyboardHelpIconFactory.spaceOrEnter(), {
          labelInnerContent: addElementsStrings.createElement.labelInnerContentStringProperty
        }
      )
    ] );

    const connectElementsSection = new KeyboardHelpSection( connectElementsStrings.headingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(
        connectElementsStrings.grabJunction.labelStringProperty,
        KeyboardHelpIconFactory.spaceOrEnter(), {
          labelInnerContent: connectElementsStrings.grabJunction.labelInnerContentStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        connectElementsStrings.selectTarget.labelStringProperty,
        KeyboardHelpIconFactory.arrowKeysRowIcon(), {
          labelInnerContent: connectElementsStrings.selectTarget.labelInnerContentStringProperty
        }
      ),
      KeyboardHelpSectionRow.labelWithIcon(
        connectElementsStrings.attachJunction.labelStringProperty,
        KeyboardHelpIconFactory.spaceOrEnter(), {
          labelInnerContent: connectElementsStrings.attachJunction.labelInnerContentStringProperty
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
