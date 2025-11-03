// Copyright 2025, University of Colorado Boulder

/**
 * Utility function to get the CircuitElementType from a CircuitElement instance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type CircuitElement from './CircuitElement.js';
import type CircuitElementType from './CircuitElementType.js';

/**
 * Returns the CircuitElementType for a given CircuitElement instance.
 */
const getCircuitElementType = ( circuitElement: CircuitElement | null ): CircuitElementType => {
  return circuitElement ? circuitElement.type : 'wire';
};

export default getCircuitElementType;