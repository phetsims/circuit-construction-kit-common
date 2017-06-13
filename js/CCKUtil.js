// Copyright 2017, University of Colorado Boulder

/**
 * Static utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );

  /**
   * @constructor
   */
  function CCKUtil() {
  }

  circuitConstructionKitCommon.register( 'CCKUtil', CCKUtil );

  return inherit( Object, CCKUtil, {}, {

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
    },

    /**
     * Returns a string that adjusts its ampere value.
     * @param ampereString {string} - string that needs at least one placeholder
     * @param value {number} - ampere value
     * @returns {*|string}
     */
    createAmpereReadout: function( ampereString, value ) {
      return StringUtils.fillIn( ampereString, { ampere: Util.toFixed( Math.abs( value ), 2 ) } );
    },

    /**
     * Returns a string that adjusts its voltage value.
     * @param ampereString {string} - string that needs at least one placeholder
     * @param value {number} - voltage value
     * @returns {*|string}
     */
    createVoltageReadout: function( ampereString, value ) {
      return StringUtils.fillIn( ampereString, { voltage: Util.toFixed( Math.abs( value ), 2 ) } );
    }

  } );
} );