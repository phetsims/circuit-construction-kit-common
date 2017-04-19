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
  var colorTable = [
    { name: 'none', significantFigure: '-', multiplier: null, tolerance: 20, color: null },
    { name: 'pink', significantFigure: '-', multiplier: 'e-3', tolerance: null, color: new Color( 255, 105, 180 ) },
    { name: 'silver', significantFigure: '-', multiplier: 'e-2', tolerance: 10, color: new Color( 192, 192, 192 ) },
    { name: 'gold', significantFigure: '-', multiplier: 'e-1', tolerance: 5, color: new Color( 207, 181, 59 ) },
    { name: 'black', significantFigure: '0', multiplier: 'e+0', tolerance: null, color: new Color( 0, 0, 0 ) },
    { name: 'brown', significantFigure: '1', multiplier: 'e+1', tolerance: 1, color: new Color( 150, 75, 0 ) },
    { name: 'red', significantFigure: '2', multiplier: 'e+2', tolerance: 2, color: new Color( 255, 0, 0 ) },
    { name: 'orange', significantFigure: '3', multiplier: 'e+3', tolerance: null, color: new Color( 255, 165, 0 ) },
    { name: 'yellow', significantFigure: '4', multiplier: 'e+4', tolerance: null, color: new Color( 255, 255, 0 ) },
    { name: 'green', significantFigure: '5', multiplier: 'e+5', tolerance: 0.5, color: new Color( 154, 205, 50 ) },
    { name: 'blue', significantFigure: '6', multiplier: 'e+6', tolerance: 0.25, color: new Color( 100, 149, 237 ) },
    { name: 'violet', significantFigure: '7', multiplier: 'e+7', tolerance: 0.1, color: new Color( 148, 0, 211 ) },
    { name: 'gray', significantFigure: '8', multiplier: 'e+8', tolerance: 0.05, color: new Color( 160, 160, 160 ) },
    { name: 'white', significantFigure: '9', multiplier: 'e+9', tolerance: null, color: new Color( 255, 255, 255 ) }
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

      var smallerMagnitude = (resistance / 10).toExponential( 1 );
      var substring = smallerMagnitude.substring( smallerMagnitude.indexOf( 'e' ) + 1 );

      // TODO: accommodate numbers with 2 digits in the exponent like 1.5e+16
      var decimalMultiplier = 'e' + substring;

      // Find the lowest tolerance that accommodates the error
      var approximateValue = parseFloat( firstSignificantDigit + secondSignificantDigit + decimalMultiplier );
      var percentError = (resistance - approximateValue) / resistance * 100;
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

      // find the lowest tolerance that fits the value
      // TODO: Do we want to restrict tolerance to silver/gold/none?
      var entries = [
        colorFor( 'significantFigure', firstSignificantDigit ),
        colorFor( 'significantFigure', secondSignificantDigit ),
        colorFor( 'multiplier', decimalMultiplier ),
        colorFor( 'tolerance', color.tolerance )
      ];

      // for debugging, output the color bands
      console.log( resistance + ' => ' + entries.map( function( band ) {
          return band.name;
        } ) );

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