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
  function CircuitConstructionKitCommonUtil() {
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitCommonUtil', CircuitConstructionKitCommonUtil );

  return inherit( Object, CircuitConstructionKitCommonUtil, {}, {

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
     * Returns a string that adjusts its value based on the key and value associated with it.
     * @param unitsString {string} - string that needs at least one placeholder
     * @param unit {string} - to be used as a key in an object literal
     * @param value {number} - value to be the value associated with the key and displayed in the returned string
     * @param decimalPlace {number} - determines how many decimal places will be shown in readout
     * @returns {string}
     */
    createMeasurementReadout: function( unitsString, unit, value, decimalPlace ) {
      var readout = {};
      readout[ unit ] = Util.toFixed( Math.abs( value ), decimalPlace );
      return StringUtils.fillIn( unitsString, readout );
    }
  } );
} );