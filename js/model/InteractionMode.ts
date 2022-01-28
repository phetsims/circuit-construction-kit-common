// Copyright 2021, University of Colorado Boulder
// @author Sam Reid (PhET Interactive Simulations)
const InteractionModeValues = [ 'explore', 'test' ] as const;
type InteractionMode = typeof InteractionModeValues[number];

export type { InteractionMode as default };
export { InteractionModeValues };