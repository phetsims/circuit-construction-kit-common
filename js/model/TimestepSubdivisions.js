// Copyright 2019-2020, University of Colorado Boulder

/**
 * TimestepSubdivisions updates a state over an interval dt by (potentially) subdividing it into smaller regions,
 * potentially with different lengths. To select the (sub) time step for each iteration, the difference between an
 * update of h and two updates of h/2 are performed. If the error between the h vs. 2x(h/2) states is within the
 * tolerated threshold, the time step is accepted. See Unfuddle#2241. Ported from Java on Feb 11, 2019
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ResultSet from './ResultSet.js';

// threshold for determining whether 2 states are similar enough; any error less than errorThreshold will be tolerated.
const MIN_DT = 1E-5;

//threshold for determining whether 2 states are similar enough; any error less than errorThreshold will be tolerated.
const ERROR_THRESHOLD = 1E-5;

class TimestepSubdivisions {

  /**
   * REVIEW: JSDoc improvements, these clearly can't be any objects, and I don't see what the API is at first glance
   * @param {Object} originalState
   * @param {Object} steppable with update function
   * @param {number} dt
   * @returns {ResultSet}
   * @public
   */
  stepInTimeWithHistory( originalState, steppable, dt ) {
    let state = originalState;
    let elapsed = 0.0;
    const states = [];
    while ( elapsed < dt ) {

      //use the last obtained dt as a starting value, if possible
      const seedValue = states.length > 0 ? states[ states.length - 1 ].subdivisionDT : dt;

      // try to increase first, in case higher dt has acceptable error, but don't try to double dt if it is first state
      const startScale = states.length > 0 ? 2 : 1;
      let subdivisionDT = this.getTimestep( state, steppable, seedValue * startScale );
      if ( subdivisionDT + elapsed > dt ) {
        subdivisionDT = dt - elapsed; // don't exceed max allowed dt
      }
      state = steppable.update( state, subdivisionDT );
      states.push( { subdivisionDT: subdivisionDT, state: state } );
      elapsed = elapsed + subdivisionDT;
    }
    return new ResultSet( states );
  }

  /**
   * Recursively searches for a value of dt that has acceptable error, starting with the value dt
   *
   * @param {Object} state     the initial state
   * @param {Object} steppable the update algorithm and distance metric
   * @param {number} dt        the initial value to use for dt
   * @returns {number} the selected timestep that has acceptable error or meets the minimum allowed
   * @private
   */
  getTimestep( state, steppable, dt ) {
    if ( dt < MIN_DT ) {
      return MIN_DT;
    }
    else if ( this.errorAcceptable( state, steppable, dt ) ) {
      return dt;
    }
    else {
      return this.getTimestep( state, steppable, dt / 2 );
    }
  }

  /**
   * @param {Object} state
   * @param {Object} steppable with update function
   * @param {number} dt
   * @returns {boolean}
   * @private
   */
  errorAcceptable( state, steppable, dt ) {
    const a = steppable.update( state, dt );
    const b1 = steppable.update( state, dt / 2 );
    const b2 = steppable.update( b1, dt / 2 );
    const distance = steppable.distance( a, b2 );
    assert && assert( !isNaN( distance ), 'distance should be numeric' );
    return distance < ERROR_THRESHOLD;
  }
}

circuitConstructionKitCommon.register( 'TimestepSubdivisions', TimestepSubdivisions );
export default TimestepSubdivisions;