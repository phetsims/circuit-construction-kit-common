// Copyright 2019, University of Colorado Boulder

/**
 * TODO: Documentation
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

    getFinalState() {return this.states[ this.states.length - 1 ].state;}

    getTotalTime() {
      let sum = 0;
      this.states.forEach( state => {sum += state.dt;} );
      return sum;
    }
  }

  return circuitConstructionKitCommon.register( 'ResultSet', ResultSet );
} );