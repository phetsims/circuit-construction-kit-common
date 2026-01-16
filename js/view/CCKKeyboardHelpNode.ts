// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard help content shared by Circuit Construction Kit screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import MoveDraggableItemsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/MoveDraggableItemsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CCKCScreenView from './CCKCScreenView.js';
import ChooseJunctionConnectionKeyboardHelpSection from './ChooseJunctionConnectionKeyboardHelpSection.js';
import CircuitComponentsAndToolsKeyboardHelpSection from './CircuitComponentsAndToolsKeyboardHelpSection.js';

export default class CCKKeyboardHelpNode extends TwoColumnKeyboardHelpContent {

  public constructor() {

    // Left column sections
    const circuitComponentsAndToolsSection = new CircuitComponentsAndToolsKeyboardHelpSection();
    const chooseConnectionSection = new ChooseJunctionConnectionKeyboardHelpSection();
    const moveDraggableItemsSection = new MoveDraggableItemsKeyboardHelpSection();

    // Align icons in left column
    KeyboardHelpSection.alignHelpSectionIcons( [
      circuitComponentsAndToolsSection,
      chooseConnectionSection,
      moveDraggableItemsSection
    ] );

    // Right column sections
    const basicActionsSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    const focusSection = new KeyboardHelpSection( CircuitConstructionKitCommonFluent.keyboardHelpDialog.focus.headingStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData( CCKCScreenView.FOCUS_TOOLBOX_HOTKEY_DATA ),
      KeyboardHelpSectionRow.fromHotkeyData( CCKCScreenView.FOCUS_CONSTRUCTION_AREA_HOTKEY_DATA )
    ] );

    super(
      [ circuitComponentsAndToolsSection, chooseConnectionSection, moveDraggableItemsSection ],
      [ basicActionsSection, focusSection ]
    );
  }
}

circuitConstructionKitCommon.register( 'CCKKeyboardHelpNode', CCKKeyboardHelpNode );
