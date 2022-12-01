// Copyright 2021-2022, University of Colorado Boulder

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * How the ammeter readout is displayed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class AmmeterReadoutType extends EnumerationValue {
  public static readonly MAGNITUDE = new AmmeterReadoutType();
  public static readonly SIGNED = new AmmeterReadoutType();
  public static readonly enumeration = new Enumeration( AmmeterReadoutType );
}

circuitConstructionKitCommon.register( 'AmmeterReadoutType', AmmeterReadoutType );