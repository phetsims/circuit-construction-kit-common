// Copyright 2021, University of Colorado Boulder

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * How the ammeter readout is displayed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
const AmmeterReadoutTypeValues = [ 'magnitude', 'signed' ] as const;
type AmmeterReadoutType = ( typeof AmmeterReadoutTypeValues )[number];
circuitConstructionKitCommon.register( 'AmmeterReadoutTypeValues', AmmeterReadoutTypeValues );
export { AmmeterReadoutTypeValues };
export type { AmmeterReadoutType as default };
