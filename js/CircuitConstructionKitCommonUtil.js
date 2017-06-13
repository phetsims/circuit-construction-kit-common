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

  // strings
  var ampereUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ampereUnits' );
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
     * Returns a string that adjusts its ampere value.
     * @param value {number} - number of Amps
     * @returns {string}
     * @public
     */
    createCurrentReadout: function( value ) {

      // Show 3 decimal places so that current can still be seen with a glowing high-resistance bulb
      return StringUtils.fillIn( ampereUnitsString, { ampere: Util.toFixed( Math.abs( value ), 3 ) } );
    },

    /**
     * Returns a string that adjusts its voltage value.
     * @param value {number} - voltage value in Volts
     * @returns {string}
     * @public
     */
    createVoltageReadout: function( value ) {
      return StringUtils.fillIn( voltageUnitsString, { voltage: Util.toFixed( Math.abs( value ), 2 ) } );
    },

    /**
     * Checks whether a child should be in the scene graph and adds/removes it as necessary
     * @param inSceneGraph {boolean} - should the child be shown in the scene graph
     * @param parent {Node} - parent that contains the child in the scene graph
     * @param child {Node} - child added/removed from scene graph
     * @public
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