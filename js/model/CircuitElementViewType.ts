// Copyright 2021, University of Colorado Boulder

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * Enumeration for how to render the circuit elements: lifelike or schematic.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// The values
const CircuitElementViewTypeValues = [ 'lifelike', 'schematic' ] as const;

// The string literal union type
type CircuitElementViewType = ( typeof CircuitElementViewTypeValues )[number];

// Register the values available at runtime.  Note it does not match the filename
circuitConstructionKitCommon.register( 'CircuitElementViewTypeValues', CircuitElementViewTypeValues );

// Export
export { CircuitElementViewType as default, CircuitElementViewTypeValues };