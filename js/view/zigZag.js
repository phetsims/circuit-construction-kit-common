// Copyright 2019, University of Colorado Boulder

/**
 * Append zig zag commands to a shape.  TODO: Should this be moved to Shape.js?
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  /**
   * @param {Vector2} start - the beginning of the shape
   * @param {Vector2} end - the end of the shape
   * @param {number} amplitude - the vertical amplitude of the zig zag wave
   * @param {number} numberZigZags - the number of oscillations
   * @param {Shape} shape - to fill with moveTo/lineTo commands
   */
  const zigZag = ( start, end, amplitude, numberZigZags, shape ) => {

    const delta = end.minus( start );
    const directionUnitVector = delta.normalized();
    const amplitudeNormalVector = directionUnitVector.perpendicular.times( amplitude );
    const wavelength = delta.magnitude / numberZigZags;

    shape.moveToPoint( start );
    for ( let i = 0; i < numberZigZags; i++ ) {
      const waveOrigin = directionUnitVector.times( i * wavelength ).plus( start );

      const topPoint = waveOrigin.plus( directionUnitVector.times( wavelength / 4 ) ).plus( amplitudeNormalVector );
      const bottomPoint = waveOrigin.plus( directionUnitVector.times( 3 * wavelength / 4 ) ).minus( amplitudeNormalVector );
      shape.lineToPoint( topPoint );
      shape.lineToPoint( bottomPoint );
    }
    shape.lineToPoint( end );
  };

  return circuitConstructionKitCommon.register( 'zigZag', zigZag );
} );