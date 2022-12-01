// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class InteractionMode extends EnumerationValue {
  public static readonly EXPLORE = new InteractionMode();
  public static readonly TEST = new InteractionMode();
  private static readonly enumeration = new Enumeration( InteractionMode );
}

circuitConstructionKitCommon.register( 'InteractionMode', InteractionMode );