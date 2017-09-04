// Copyright 2016-2017, University of Colorado Boulder

/**
 * Ported directly from "the Java".
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Color = require( 'SCENERY/util/Color' );

  // See https://en.wikipedia.org/wiki/Electronic_color_code#Resistor_color-coding
  // Tolerances below gold were eliminated to reduce variance in the tolerance band, see
  // https://github.com/phetsims/circuit-construction-kit-dc/issues/10
  var colorTable = [
    { name: 'none', significantFigure: null, multiplier: null, tolerance: 20, color: null },
    { name: 'pink', significantFigure: null, multiplier: -3, tolerance: null, color: new Color( 255, 105, 180 ) },
    { name: 'silver', significantFigure: null, multiplier: -2, tolerance: 10, color: new Color( 192, 192, 192 ) },

    // chose a different color that shows up better against the resistor color
    { name: 'gold', significantFigure: null, multiplier: -1, tolerance: 5, color: new Color( '#e6b600' ) },
    { name: 'black', significantFigure: 0, multiplier: 0, tolerance: null, color: new Color( 0, 0, 0 ) },
    { name: 'brown', significantFigure: 1, multiplier: 1, tolerance: null, color: new Color( 150, 75, 0 ) },
    { name: 'red', significantFigure: 2, multiplier: 2, tolerance: null, color: new Color( 255, 0, 0 ) },
    { name: 'orange', significantFigure: 3, multiplier: 3, tolerance: null, color: new Color( 255, 165, 0 ) },
    { name: 'yellow', significantFigure: 4, multiplier: 4, tolerance: null, color: new Color( 255, 255, 0 ) },
    { name: 'green', significantFigure: 5, multiplier: 5, tolerance: null, color: new Color( 154, 205, 50 ) },
    { name: 'blue', significantFigure: 6, multiplier: 6, tolerance: null, color: new Color( 100, 149, 237 ) },
    { name: 'violet', significantFigure: 7, multiplier: 7, tolerance: null, color: new Color( 148, 0, 211 ) },
    { name: 'gray', significantFigure: 8, multiplier: 8, tolerance: null, color: new Color( 160, 160, 160 ) },
    { name: 'white', significantFigure: 9, multiplier: 9, tolerance: null, color: new Color( 255, 255, 255 ) }
  ];

  /**
   * Gets the color table entry for the specified column in the colorTable
   * @param {string} keyName - the name of the key, such as 'significantFigure'|'multiplier'|'tolerance'
   * @param {string|number|null} value - the value to search for
   * @returns {Object} - entry from the color table, see above
   */
  var getEntry = function( keyName, value ) {
    return _.find( colorTable, function( colorTableEntry ) {
      return colorTableEntry[ keyName ] === value;
    } );
  };

  var ResistorColors = {

    /**
     * Get the color table entries for the specified resistance.
     * @param {number} resistance
     * @returns {Object[]} entries from the color table
     * @private
     */
    getEntries: function( resistance ) {
      assert && assert( resistance >= 0, 'resistance should be non-negative' );

      // 0 resistance has a single black band centered on the resistor
      if ( resistance === 0 ) {
        return [ getEntry( 'name', 'black' ) ];
      }

      // Estimate the exponent
      var exponent = Math.round( Math.log( resistance ) / Math.log( 10 ) );

      // Divide out to normalize
      var reduced = resistance / Math.pow( 10, exponent );

      // If we went too far, jump up a digit
      if ( reduced < 1 ) {
        reduced = reduced * 10;
        exponent--;
      }

      // Chop off the tail to get the first significant digit
      var firstSignificantDigit = Math.floor( reduced );

      // Chop off first significant digit, then bump up >1 and take first digit
      var x = ( reduced - firstSignificantDigit ) * 10;
      //REVIEW*: roundSymmetric?
      var secondSignificantDigit = Math.round( x ); //round to prevent cases like resistance=4700 = x2 = 6.99999

      // prevent rounding up from 9.5 to 10.0
      if ( secondSignificantDigit === 10 ) {
        secondSignificantDigit = 9; //hack alert
      }

      // Estimate the value to obtain tolerance band
      var approximateValue = ( firstSignificantDigit + secondSignificantDigit / 10 ) * Math.pow( 10, exponent );
      var percentError = Math.abs( ( resistance - approximateValue ) / resistance * 100 );
      var colorsWithTolerance = _.filter( colorTable, function( colorTableEntry ) {
        return colorTableEntry.tolerance !== null;
      } );

      // find the lowest tolerance that fits the value
      var sortedColorsWithTolerance = _.sortBy( colorsWithTolerance, 'tolerance' );
      for ( var i = 0; i < sortedColorsWithTolerance.length; i++ ) {
        var color = sortedColorsWithTolerance[ i ];
        if ( color.tolerance > percentError ) {
          break;
        }
      }
      assert && assert( percentError < color.tolerance, 'no tolerance high enough to accommodate error' );
      return [
        getEntry( 'significantFigure', firstSignificantDigit ),
        getEntry( 'significantFigure', secondSignificantDigit ),
        getEntry( 'multiplier', exponent - 1 ), // second significant figure counts for a power (see https://en.wikipedia.org/wiki/Electronic_color_code and 4700 ohm example)
        getEntry( 'tolerance', color.tolerance )
      ];
    },

    /**
     * For debugging and testing, get the human-readable color names.
     * @param {number} resistance
     * @returns {string[]}
     * @public
     */
    getColorNames: function( resistance ) {
      return _.map( this.getEntries( resistance ), 'name' );
    },

    /**
     * Return the colors for the given resistance
     * @param {number} resistance
     * @returns {Object[]}
     * @public
     */
    getColorArray: function( resistance ) {
      return _.map( this.getEntries( resistance ), 'color' );
    }
  };

  circuitConstructionKitCommon.register( 'ResistorColors', ResistorColors );

  return ResistorColors;
} );