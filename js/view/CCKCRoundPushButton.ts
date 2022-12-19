// Copyright 2019-2022, University of Colorado Boulder

/**
 * Base type for buttons that appear in the CircuitElementEditPanels
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import RoundPushButton, { RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class CCKCRoundPushButton extends RoundPushButton {

  /**
   * @param [providedOptions]
   */
  public constructor( providedOptions?: RoundPushButtonOptions ) {
    super( combineOptions<RoundPushButtonOptions>( {
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 10,
      yMargin: 10
    }, providedOptions ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCRoundPushButton', CCKCRoundPushButton );