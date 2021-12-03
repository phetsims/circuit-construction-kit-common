// Copyright 2021, University of Colorado Boulder

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * Whether the sim is zoomed out or not.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
const ZoomLevelValues = [ 'normal', 'zoomedOut' ] as const;
type ZoomLevel = ( typeof ZoomLevelValues )[number];
circuitConstructionKitCommon.register( 'ZoomLevelValues', ZoomLevelValues );
export { ZoomLevelValues };
export type { ZoomLevel as default };