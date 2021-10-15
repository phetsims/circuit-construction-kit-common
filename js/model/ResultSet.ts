// Copyright 2019-2021, University of Colorado Boulder

/**
 * A progression of states over time, obtained from TimestepSubdivisions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitSolution from './DynamicCircuitSolution.js';

type Element = {
  state: {
    dynamicCircuitSolution: DynamicCircuitSolution
  }
  dt: number
};

class ResultSet<T> {
  readonly states: Element[];

  /**
   * @param {Object[]} states
   */
  constructor( states: Element[] ) {
    // @public {Object[]}
    this.states = states;
  }

  /**
   * Returns the last element in the list of states.
   *
   * @returns {Object}
   * @public
   */
  getFinalState() { return this.states[ this.states.length - 1 ].state; }

  /**
   * Returns the total amount of time elapsed over all the states.
   *
   * @returns {number}
   * @public
   */
  getTotalTime() {
    let sum = 0;
    this.states.forEach( state => {sum += state.dt;} );
    return sum;
  }
}

circuitConstructionKitCommon.register( 'ResultSet', ResultSet );
export default ResultSet;