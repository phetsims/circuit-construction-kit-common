// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class InteractionMode extends EnumerationValue {
  public static readonly EXPLORE = new InteractionMode();
  public static readonly TEST = new InteractionMode();

  public static readonly enumeration = new Enumeration( InteractionMode );
}

circuitConstructionKitCommon.register( 'InteractionMode', InteractionMode );