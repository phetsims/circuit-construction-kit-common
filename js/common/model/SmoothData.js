// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );

  function SmoothData( windowSize ) {
    this.windowSize = windowSize;
    this.data = [];
  }

  circuitConstructionKitCommon.register( 'SmoothData', SmoothData );

  return inherit( Object, SmoothData, {

    numDataPoints: function() {return this.data.length;},
    getWindowSize: function() {return this.windowSize;},
    clear: function() {
      this.data.length = [];
    },

    addData: function( d ) {
      this.data.push( d );
      while ( this.data.length > this.windowSize ) {
        this.data.splice( 0, 1 );
      }
    },
    getAverage: function() {
      return _.foldl( this.data, function( a, b ) {return a + b;} ) / this.data.length;
    }
  } );
} );