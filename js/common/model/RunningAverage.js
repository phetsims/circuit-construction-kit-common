// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Data structure that keeps track of running average over a given window.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var SUM = function( a, b ) {return a + b;};

  function RunningAverage( windowSize ) {

    // @private
    this.windowSize = windowSize;

    // @private
    this.samples = [];
  }

  circuitConstructionKitCommon.register( 'RunningAverage', RunningAverage );

  return inherit( Object, RunningAverage, {

    /**
     * Clear the running average.
     * @public
     */
    clear: function() {
      this.samples.length = 0;
    },

    /**
     * Add a data point to the average.
     * @param d
     * @public
     */
    addSample: function( d ) {
      this.samples.push( d );
      while ( this.samples.length > this.windowSize ) {
        this.samples.splice( 0, 1 );
      }
    },

    /**
     * Get the current value of the average.
     * @returns {number}
     * @public
     */
    getAverage: function() {
      return _.foldl( this.samples, SUM ) / this.samples.length;
    }
  } );
} );