// Copyright 2021, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
const SchematicTypeValues = [ 'iec', 'ieee', 'british' ] as const;
type SchematicType = typeof SchematicTypeValues[number];
export default SchematicType;
export { SchematicTypeValues };