// Copyright 2003-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Ported directly from the Java.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );

  // See https://en.wikipedia.org/wiki/Electronic_color_code#Resistor_color-coding
  // Tolerances below gold were eliminated to reduce variance in the tolerance band, see https://github.com/phetsims/circuit-construction-kit-dc/issues/10
  var colorTable = [
    { name: 'none', significantFigure: '-', multiplier: null, tolerance: 20, color: null },
    { name: 'pink', significantFigure: '-', multiplier: 'e-3', tolerance: null, color: new Color( 255, 105, 180 ) },
    { name: 'silver', significantFigure: '-', multiplier: 'e-2', tolerance: 10, color: new Color( 192, 192, 192 ) },
    { name: 'gold', significantFigure: '-', multiplier: 'e-1', tolerance: 5, color: new Color( '#e6b600' ) }, // chose a different color that shows up better against the resistor color
    { name: 'black', significantFigure: '0', multiplier: 'e0', tolerance: null, color: new Color( 0, 0, 0 ) },
    { name: 'brown', significantFigure: '1', multiplier: 'e1', tolerance: null, color: new Color( 150, 75, 0 ) },
    { name: 'red', significantFigure: '2', multiplier: 'e2', tolerance: null, color: new Color( 255, 0, 0 ) },
    { name: 'orange', significantFigure: '3', multiplier: 'e3', tolerance: null, color: new Color( 255, 165, 0 ) },
    { name: 'yellow', significantFigure: '4', multiplier: 'e4', tolerance: null, color: new Color( 255, 255, 0 ) },
    { name: 'green', significantFigure: '5', multiplier: 'e5', tolerance: null, color: new Color( 154, 205, 50 ) },
    { name: 'blue', significantFigure: '6', multiplier: 'e6', tolerance: null, color: new Color( 100, 149, 237 ) },
    { name: 'violet', significantFigure: '7', multiplier: 'e7', tolerance: null, color: new Color( 148, 0, 211 ) },
    { name: 'gray', significantFigure: '8', multiplier: 'e8', tolerance: null, color: new Color( 160, 160, 160 ) },
    { name: 'white', significantFigure: '9', multiplier: 'e9', tolerance: null, color: new Color( 255, 255, 255 ) }
  ];

  function ResistorColors() {
  }

  var colorFor = function( keyName, value ) {
    var filtered = _.filter( colorTable, function( colorTableEntry ) {
      return colorTableEntry[ keyName ] === value;
    } );
    assert && assert( filtered.length === 1, 'wrong number of matches' );
    return filtered[ 0 ];
  };

  circuitConstructionKitCommon.register( 'ResistorColors', ResistorColors );

  return inherit( Object, ResistorColors, {}, {

    getEntries: function( resistance ) {
      assert && assert( resistance >= 0, 'resistance should be non-negative' );

      // 0 resistance has a single black band centered on the resistor
      if ( resistance === 0 ) {
        return [ colorFor( 'name', 'black' ) ];
      }
      var exponential = resistance.toExponential( 1 ); // like `1.5e+7`
      var firstSignificantDigit = exponential[ 0 ];
      assert && assert( exponential[ 1 ] === '.', 'incorrect pattern' );
      var secondSignificantDigit = exponential[ 2 ];

      var exponentString = exponential.substring( exponential.indexOf( 'e' ) + 1 );
      var exponentNumber = parseInt( exponentString, 10 );
      exponentNumber = exponentNumber - 1; // Because the decimal is omitted from the number

      var decimalMultiplier = 'e' + exponentNumber;

      // Find the lowest tolerance that accommodates the error
      var approximateValue = parseFloat( firstSignificantDigit + secondSignificantDigit + decimalMultiplier );
      var percentError = Math.abs( (resistance - approximateValue) / resistance * 100 );
      var colorsWithTolerance = _.filter( colorTable, function( colorTableEntry ) {
        return colorTableEntry.tolerance !== null;
      } );
      var sortedColorsWithTolerance = _.sortBy( colorsWithTolerance, 'tolerance' );
      for ( var i = 0; i < sortedColorsWithTolerance.length; i++ ) {
        var color = sortedColorsWithTolerance[ i ];
        if ( color.tolerance > percentError ) {
          break;
        }
      }
      assert && assert( percentError < color.tolerance, 'no tolerance high enough to accommodate error' );

      // find the lowest tolerance that fits the value
      var entries = [
        colorFor( 'significantFigure', firstSignificantDigit ),
        colorFor( 'significantFigure', secondSignificantDigit ),
        colorFor( 'multiplier', decimalMultiplier ),
        colorFor( 'tolerance', color.tolerance )
      ];

      return entries;
    },
    getColorNames: function( resistance ) {
      return this.getEntries( resistance ).map( function( band ) {
        return band.name;
      } );
    },
    getColorArray: function( resistance ) {
      return this.getEntries( resistance ).map( function( band ) {
        return band.color;
      } );
    }
  } );
} );