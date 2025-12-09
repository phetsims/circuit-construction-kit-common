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
import CCKCScreenView from './CCKCScreenView.js';
import ChooseJunctionConnectionKeyboardHelpSection from './ChooseJunctionConnectionKeyboardHelpSection.js';

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

    const focusSection = new KeyboardHelpSection( CircuitConstructionKitCommonStrings.a11y.keyboardHelpDialog.focus.headingStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData( CCKCScreenView.FOCUS_TOOLBOX_HOTKEY_DATA ),
      KeyboardHelpSectionRow.fromHotkeyData( CCKCScreenView.FOCUS_CONSTRUCTION_AREA_HOTKEY_DATA )
    ] );

    const chooseJunctionConnectionSection = new ChooseJunctionConnectionKeyboardHelpSection();

    const basicActionsSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    super( [ addElementsSection, chooseJunctionConnectionSection, focusSection ], [ basicActionsSection ] );
  }
}

circuitConstructionKitCommon.register( 'CCKKeyboardHelpNode', CCKKeyboardHelpNode );
