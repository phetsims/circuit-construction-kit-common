// Copyright 2021, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * How the ammeter readout is displayed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
class AmmeterReadoutType extends EnumerationValue {
  static MAGNITUDE = new AmmeterReadoutType();
  static SIGNED = new AmmeterReadoutType();
  static enumeration = new Enumeration( AmmeterReadoutType );
}

circuitConstructionKitCommon.register( 'AmmeterReadoutType', AmmeterReadoutType );
export default AmmeterReadoutType;