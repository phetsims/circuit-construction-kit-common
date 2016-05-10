// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );

  function SmoothData( windowSize ) {
    this.windowSize = windowSize;
    this.data = [];
  }

  circuitConstructionKit.register( 'SmoothData', SmoothData );

  return inherit( Object, SmoothData, {

    numDataPoints: function() {return this.data.length;},
    getWindowSize: function() {return this.windowSize;},

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