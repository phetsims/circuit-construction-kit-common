// Copyright 2017-2021, University of Colorado Boulder

/**
 * Enumeration for how to render the current: electrons or conventional (arrows).
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const CurrentTypeValues = [ 'electrons', 'conventional' ] as const;
type CurrentType = ( typeof CurrentTypeValues )[number];
circuitConstructionKitCommon.register( 'CurrentTypeValues', CurrentTypeValues );
export { CurrentTypeValues };
export type { CurrentType as default };