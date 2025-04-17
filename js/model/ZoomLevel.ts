// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class ZoomLevel extends EnumerationValue {
  public static readonly NORMAL = new ZoomLevel();
  public static readonly ZOOMED_OUT = new ZoomLevel();

  public static readonly enumeration = new Enumeration( ZoomLevel );
}

circuitConstructionKitCommon.register( 'ZoomLevel', ZoomLevel );