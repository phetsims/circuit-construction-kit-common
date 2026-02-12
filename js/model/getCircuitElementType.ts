// Copyright 2025-2026, University of Colorado Boulder

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

  //REVIEW: Why does a parameter of 'null' return null?  Seems odd, so should be documented.
  return circuitElement ? circuitElement.type : 'wire';
};

export default getCircuitElementType;