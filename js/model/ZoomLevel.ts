// Copyright 2021, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
class ZoomLevel extends EnumerationValue {
  static NORMAL = new ZoomLevel();
  static ZOOMED_OUT = new ZoomLevel();
  static enumeration = new Enumeration( ZoomLevel );
}

circuitConstructionKitCommon.register( 'ZoomLevel', ZoomLevel );
export default ZoomLevel;