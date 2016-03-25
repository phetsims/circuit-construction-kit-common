// Copyright 2003-2016, University of Colorado Boulder

/**
 * Ported directly from the Java.
 * 
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'DOT/Util' );

  var brown = new Color( 200, 150, 100 );
  var violet = new Color( 148, 0, 211 );
  var gold = new Color( '#e8c920' );
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

  return inherit( Object, ResistorColors, {}, {

    toThreeColors: function( value ) {
      value = Math.round( value );
      //first 2 digits for value, third digit for scale.
      if ( value < 10 ) {
        return [ Color.black, digitToColor( value ), Color.black, gold ];
      }
      else if ( value < 100 ) {
        return [ digitToColor( Math.floor( value / 10 ) ), digitToColor( Math.floor( value % 10 ) ), Color.black, Color.yellow ];
      }
      else {
        var s = Util.toFixed( value, 0 );
        var firstdigit = parseInt( s.charAt( 0 ) + '', 10 );
        var seconddig = parseInt( s.charAt( 1 ) + '', 10 );
        var factor = s.length - 2;

        var predicted = ( ( firstdigit * 10 + seconddig ) * Math.pow( 10, factor ) );
        var offby = ( value - predicted ) / predicted * 100;
        var tolerance = null;

        // A gold tolerance band is 5% tolerance, silver is 10%
        if ( offby < 5 ) {
          tolerance = gold;
        }
        else if ( offby < 20 ) {
          tolerance = new Color( 'silver' );
        }
        else {
          tolerance = null;
        }
        return [ digitToColor( firstdigit ), digitToColor( seconddig ), digitToColor( factor ), tolerance ];
      }
    }
  } );
} );