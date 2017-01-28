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
  var Util = require( 'DOT/Util' );

  var brown = new Color( 200, 150, 100 );
  var violet = new Color( 148, 0, 211 );
  var gold = new Color( '#e8c920' ).darkerColor( 0.75 );
  var colors = [
    Color.black,
    brown,
    Color.red,
    Color.orange,
    Color.yellow,
    Color.green,
    Color.blue,
    violet,
    Color.gray,
    Color.white
  ];
  var digitToColor = function( digit ) {
    assert && assert( digit >= 0 && digit < 10, 'digit should have been between 0 and 10' );

    var color = colors[ digit ];
    assert && assert( color, 'should be a color' );
    return color;
  };

  function ResistorColors() {
  }

  circuitConstructionKitCommon.register( 'ResistorColors', ResistorColors );

  return inherit( Object, ResistorColors, {}, {

    getColorArray: function( resistance ) {
      resistance = Math.round( resistance );

      // first 2 digits for value, third digit for scale.
      if ( resistance < 10 ) {
        return [ Color.black, digitToColor( resistance ), Color.black, gold ];
      }
      else if ( resistance < 100 ) {
        return [ digitToColor( Math.floor( resistance / 10 ) ), digitToColor( Math.floor( resistance % 10 ) ), Color.black, Color.yellow ];
      }
      else {
        var resistanceString = Util.toFixed( resistance, 0 );
        var firstDigit = parseInt( resistanceString.charAt( 0 ) + '', 10 );
        var secondDigit = parseInt( resistanceString.charAt( 1 ) + '', 10 );
        var factor = resistanceString.length - 2;

        var predicted = ( ( firstDigit * 10 + secondDigit ) * Math.pow( 10, factor ) );
        var error = ( resistance - predicted ) / predicted * 100;
        var tolerance = null;

        // A gold tolerance band is 5% tolerance, silver is 10%
        if ( error < 5 ) {
          tolerance = gold;
        }
        else if ( error < 20 ) {
          tolerance = new Color( 'silver' );
        }
        else {
          tolerance = null;
        }
        return [ digitToColor( firstDigit ), digitToColor( secondDigit ), digitToColor( factor ), tolerance ];
      }
    }
  } );
} );