// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class InteractionMode extends EnumerationValue {
  public static EXPLORE = new InteractionMode();
  public static TEST = new InteractionMode();
  private static enumeration = new Enumeration( InteractionMode );
}

circuitConstructionKitCommon.register( 'InteractionMode', InteractionMode );