// Copyright 2021-2025, University of Colorado Boulder

/**
 * Enumeration for how to render the current: electrons or conventional (arrows).
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class CurrentSense extends EnumerationValue {
  public static readonly FORWARD = new CurrentSense();
  public static readonly BACKWARD = new CurrentSense();
  public static readonly UNSPECIFIED = new CurrentSense();

  public static readonly enumeration = new Enumeration( CurrentSense );
}

circuitConstructionKitCommon.register( 'CurrentSense', CurrentSense );