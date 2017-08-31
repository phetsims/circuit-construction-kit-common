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
  var Util = require( 'DOT/Util' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var currentUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/currentUnits' );
  var voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );

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
     * @public
     */
    setToTranslationRotation: function( matrix, translation, rotation ) {
      var cos = Math.cos( rotation );
      var sin = Math.sin( rotation );

      return matrix.setToAffine( cos, -sin, translation.x, sin, cos, translation.y, 0, 0, 1 );
    },

    /**
     * Typically show 2 decimal places for current and voltage readouts in the play area, but if it is a smaller value,
     * between between 0.02 and 0.001, then it should show 3 decimal places.
     * @param {number} value - the value to be formatted for display
     * @returns {number} - the number of decimal places to use for the display
     */
    getNumberOfDecimalPoints: function( value ) {
      return (value >= 0.001 && value < 0.02 ) ? 3 : 2;
    },

    /**
     * Returns a string that adjusts its ampere value.
     * @param current {number} - number of Amps
     * @returns {string}
     * @public
     */
    createCurrentReadout: function( current ) {
      var absoluteCurrent = Math.abs( current );
      var decimals = this.getNumberOfDecimalPoints( absoluteCurrent );

      // Show 3 decimal places so that current can still be seen with a glowing high-resistance bulb
      return StringUtils.fillIn( currentUnitsString, { current: Util.toFixed( absoluteCurrent, decimals ) } );
    },

    /**
     * Returns a string that adjusts its voltage value.
     * @param value {number} - voltage value in Volts
     * @returns {string}
     * @public
     */
    createVoltageReadout: function( value ) {
      var decimals = this.getNumberOfDecimalPoints( value );

      return StringUtils.fillIn( voltageUnitsString, { voltage: Util.toFixed( value, decimals ) } );
    },

    /**
     * Checks whether a child should be in the scene graph and adds/removes it as necessary.  This is to improve
     * performance so that the DOM only contains displayed items and doesn't try to update invisible ones.
     * @param inSceneGraph {boolean} - should the child be shown in the scene graph
     * @param parent {Node} - parent that contains the child in the scene graph
     * @param child {Node} - child added/removed from scene graph
     * @public
     * REVIEW: How about putting this in Node.js (we can discuss a potential name)?
     * REVIEW^(samreid): A general solution should keep track of the ordering--could we accomplish this in a robust way?
     */
    setInSceneGraph: function( inSceneGraph, parent, child ) {
      if ( inSceneGraph && !parent.hasChild( child ) ) {
        parent.addChild( child );
      }
      else if ( !inSceneGraph && parent.hasChild( child ) ) {
        parent.removeChild( child );
      }
    }
  } );
} );