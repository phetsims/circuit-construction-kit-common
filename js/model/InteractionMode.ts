// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class InteractionMode extends EnumerationValue {
  static EXPLORE = new InteractionMode();
  static TEST = new InteractionMode();
  static enumeration = new Enumeration( InteractionMode );
}

circuitConstructionKitCommon.register( 'InteractionMode', InteractionMode );
export default InteractionMode;