// Copyright 2017-2019, University of Colorado Boulder

/**
 * Static utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Utils = require( 'DOT/Utils' );

  // strings
  const currentUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/currentUnits' );
  const voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );

  const CCKCUtils = {

    /**
     * Typically show 2 decimal places for current and voltage readouts in the play area, but if it is a smaller value,
     * below 0.02 and 0.001, then it should show 3 decimal places.
     * @param {number} value - the value to be formatted for display
     * @returns {number} - the number of decimal places to use for the display
     */
    getNumberOfDecimalPoints: function( value ) {
      const abs = Math.abs( value );
      return ( abs >= 0 && abs < 0.02 ) ? 3 : 2;
    },

    /**
     * Returns a string that adjusts its ampere value.
     * @param current {number} - number of Amps
     * @returns {string}
     * @public
     */
    createCurrentReadout: function( current ) {
      const absoluteCurrent = Math.abs( current );
      const decimals = this.getNumberOfDecimalPoints( absoluteCurrent );

      // Show 3 decimal places so that current can still be seen with a glowing high-resistance bulb
      return StringUtils.fillIn( currentUnitsString, { current: Utils.toFixed( absoluteCurrent, decimals ) } );
    },

    /**
     * Returns a string that adjusts its voltage value.
     * @param value {number} - voltage value in Volts
     * @returns {string}
     * @public
     */
    createVoltageReadout: function( value ) {
      const decimals = this.getNumberOfDecimalPoints( value );

      return StringUtils.fillIn( voltageUnitsString, { voltage: Utils.toFixed( value, decimals ) } );
    },

    /**
     * Checks whether a child should be in the scene graph and adds/removes it as necessary.  This is to improve
     * performance so that the DOM only contains displayed items and doesn't try to update invisible ones.
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
  };

  return circuitConstructionKitCommon.register( 'CCKCUtils', CCKCUtils );
} );