// Copyright 2017, University of Colorado Boulder

/**
 * Static math utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function CCKMathUtil() {
  }

  circuitConstructionKitCommon.register( 'CCKMathUtil', CCKMathUtil );

  return inherit( Object, CCKMathUtil, {}, {

    /**
     * Sets the values of a given Matrix to be translated the rotated
     * @param {Matrix3} matrix - the matrix to be mutated
     * @param {Vector2} translation - the translation amount
     * @param {number} rotation - the amount to rotate in radians
     * @returns {Matrix3} - the same matrix that was passed in
     */
    setToTranslationRotation: function( matrix, translation, rotation ) {
      var cos = Math.cos( rotation );
      var sin = Math.sin( rotation );

      return matrix.setToAffine( cos, -sin, translation.x, sin, cos, translation.y, 0, 0, 1 );
    }
  } );
} );