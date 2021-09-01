// Copyright 2017-2021, University of Colorado Boulder

/**
 * Enumeration for how to render the current: electrons or conventional (arrows).
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const CurrentSense = Enumeration.byKeys( [ 'FORWARD', 'BACKWARD', 'UNSPECIFIED' ], {
  beforeFreeze: CurrentSense => {

    /**
     * Reverse the sense, forward and backwards swap.  Unspecified remains unspecified.
     * @param {CurrentSense} currentSense
     * @returns {CurrentSense}
     * @static
     * @public
     */
    CurrentSense.flip = currentSense => {
      return currentSense === CurrentSense.FORWARD ? CurrentSense.BACKWARD :
             currentSense === CurrentSense.BACKWARD ? CurrentSense.FORWARD :
             CurrentSense.UNSPECIFIED;
    };
  }
} );

circuitConstructionKitCommon.register( 'CurrentSense', CurrentSense );
export default CurrentSense;