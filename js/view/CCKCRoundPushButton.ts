// Copyright 2019-2020, University of Colorado Boulder

/**
 * Base type for buttons that appear in the CircuitElementEditPanels
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class CCKCRoundPushButton extends RoundPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options: object ) {
    super( merge( {
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      xMargin: 10,
      yMargin: 10
    }, options ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCRoundPushButton', CCKCRoundPushButton );
export default CCKCRoundPushButton;