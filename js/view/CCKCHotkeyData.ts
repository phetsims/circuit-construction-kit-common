// Copyright 2025, University of Colorado Boulder

/**
 * HotkeyData for the KeyboardListeners in Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import { OneKeyStroke } from '../../../scenery/js/input/KeyDescriptor.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

function createHotkeyData( keys: OneKeyStroke[],
                           keyboardHelpDialogLabelStringProperty: TReadOnlyProperty<string> ): HotkeyData {
  return new HotkeyData( {
    keyStringProperties: keys.map( string => new Property( string ) ),
    repoName: circuitConstructionKitCommon.name,
    keyboardHelpDialogLabelStringProperty: keyboardHelpDialogLabelStringProperty
  } );
}

export default class CCKCHotkeyData {
  public static readonly SELECT_LEFT: OneKeyStroke[] = [ 'arrowLeft', 'a' ];
  public static readonly SELECT_RIGHT: OneKeyStroke[] = [ 'arrowRight', 'd' ];

  public static readonly circuitToolNode = {
    create: createHotkeyData(
      [ 'enter', 'space' ],
      new StringProperty( 'Create Circuit Element' )
    )
  };
}

circuitConstructionKitCommon.register( 'CCKCHotkeyData', CCKCHotkeyData );