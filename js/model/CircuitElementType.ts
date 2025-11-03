// Copyright 2025, University of Colorado Boulder

/**
 * CircuitElementType represents the type of a circuit element for purposes of i18n and accessibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const CircuitElementTypeValues = [ 'wire', 'battery', 'resistor', 'capacitor', 'inductor', 'lightBulb', 'acSource', 'fuse', 'switch', 'voltmeter', 'ammeter', 'stopwatch' ] as const;
type CircuitElementType = typeof CircuitElementTypeValues[number];

export default CircuitElementType;