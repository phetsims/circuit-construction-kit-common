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

  // constants
  var SUM = function( a, b ) {return a + b;};

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
      this.samples.push( sample );
      while ( this.samples.length > this.windowSize ) {
        this.samples.shift();
      }
      return _.reduce( this.samples, SUM ) / this.samples.length;
    }
  } );
} );