// Copyright 2017-2020, University of Colorado Boulder

/**
 * Enumeration for how to render the circuit elements: lifelike or schematic.
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

type CircuitElementViewType = 'lifelike'|'schematic';
export default CircuitElementViewType