// Copyright 2017, University of Colorado Boulder

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

  /**
   * @param {number} windowSize - number of points to average
   * @constructor
   */
  function RunningAverage( windowSize ) {

    assert && assert( windowSize > 0, 'window size must be positive' );

    // @private {number}
    this.windowSize = windowSize;

    // @private {number[]}
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
     * Add a data point to the average and return the new running average.
     * @param {number} sample
     * @public
     */
    updateRunningAverage: function( sample ) {
      //REVIEW: Probably not too important, but keeping a "total" of all samples in the array, adding/subtracting from
      //REVIEW: it on changes, and then dividing it by the length is more efficient (essentially 2 adds, 1 divide per
      //REVIEW: operation, instead of N-1 adds, 1 divide).
      //REVIEW^(samreid): How to keep track of the number to be subtracted from the total?
      this.samples.push( sample );
      while ( this.samples.length > this.windowSize ) {
        this.samples.shift();
      }
      return _.sum( this.samples ) / this.samples.length;
    }
  } );
} );