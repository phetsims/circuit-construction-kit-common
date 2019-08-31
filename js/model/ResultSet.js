// Copyright 2019, University of Colorado Boulder

/**
 * A progression of states over time, obtained from TimestepSubdivisions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  class ResultSet {

    /**
     * @param {Object[]} states
     */
    constructor( states ) {
      this.states = states;
    }

    /**
     * Returns the last element in the list of states.
     *
     * @returns {Object}
     * @public
     */
    getFinalState() {return this.states[ this.states.length - 1 ].state;}

    /**
     * Returns the total amount of time elapsed over all the states.
     *
     * @returns {number}
     * @public
     */
    getTotalTime() {
      let sum = 0;
      this.states.forEach( state => {sum += state.subdivisionDT;} );
      return sum;
    }
  }

  return circuitConstructionKitCommon.register( 'ResultSet', ResultSet );
} );