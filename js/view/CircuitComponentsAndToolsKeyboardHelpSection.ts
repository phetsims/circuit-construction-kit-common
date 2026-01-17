// Copyright 2026, University of Colorado Boulder

/**
 * Keyboard help section for Circuit Components and Measurement Tools.
 * Describes how to add/remove components from the toolbox and edit circuit elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import KeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';

export default class CircuitComponentsAndToolsKeyboardHelpSection extends KeyboardHelpSection {

  public constructor() {

    // Remove from toolbox [Space] or [Enter]
    const removeFromToolboxHotkeyData = new HotkeyData( {
      repoName: circuitConstructionKitCommon.name,
      keys: [ 'space', 'enter' ],
      keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.removeFromToolboxStringProperty
    } );
    const removeFromToolboxRow = KeyboardHelpSectionRow.fromHotkeyData( removeFromToolboxHotkeyData );

    // Return to toolbox [Delete] or [Backspace]
    const returnToToolboxHotkeyData = new HotkeyData( {
      repoName: circuitConstructionKitCommon.name,
      keys: [ 'delete', 'backspace' ],
      keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.returnToToolboxStringProperty
    } );
    const returnToToolboxRow = KeyboardHelpSectionRow.fromHotkeyData( returnToToolboxHotkeyData );

    // Edit component [Space] or [Enter]
    const editComponentHotkeyData = new HotkeyData( {
      repoName: circuitConstructionKitCommon.name,
      keys: [ 'space', 'enter' ],
      keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.editComponentStringProperty
    } );
    const editComponentRow = KeyboardHelpSectionRow.fromHotkeyData( editComponentHotkeyData );

    // Cut connections [Delete] or [Backspace]
    const cutConnectionsHotkeyData = new HotkeyData( {
      repoName: circuitConstructionKitCommon.name,
      keys: [ 'delete', 'backspace' ],
      keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.cutConnectionsStringProperty
    } );
    const cutConnectionsRow = KeyboardHelpSectionRow.fromHotkeyData( cutConnectionsHotkeyData );

    super( CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.headingStringProperty, [
      removeFromToolboxRow,
      returnToToolboxRow,
      editComponentRow,
      cutConnectionsRow
    ] );
  }
}

circuitConstructionKitCommon.register( 'CircuitComponentsAndToolsKeyboardHelpSection', CircuitComponentsAndToolsKeyboardHelpSection );
