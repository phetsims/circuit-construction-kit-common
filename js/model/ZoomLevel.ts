// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class ZoomLevel extends EnumerationValue {
  public static readonly NORMAL = new ZoomLevel();
  public static readonly ZOOMED_OUT = new ZoomLevel();
  private static readonly enumeration = new Enumeration( ZoomLevel );
}

circuitConstructionKitCommon.register( 'ZoomLevel', ZoomLevel );