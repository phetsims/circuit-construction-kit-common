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

class TimestepSubdivisions {

  constructor( errorThreshold, minDT ) {
    this.errorThreshold = errorThreshold; //threshold for determining whether 2 states are similar enough; any error less than errorThreshold will be tolerated.
    this.minDT = minDT; //lowest possible value for DT, independent of how the error scales with reduced time step
  }

  stepInTimeWithHistory( originalState, steppable, dt ) {
    let state = originalState;
    let elapsed = 0.0;
    const states = [];
    while ( elapsed < dt ) {
      const seedValue = states.length > 0 ? states[ states.length - 1 ].subdivisionDT : dt;//use the last obtained dt as a starting value, if possible

      // try to increase first, in case higher dt has acceptable error
      // but don't try to double dt if it is first state
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

  stepInTime( originalState, steppable, dt ) {
    return this.stepInTimeWithHistory( originalState, steppable, dt ).getFinalState();
  }

  /**
   * Recursively searches for a value of dt that has acceptable error, starting with the value dt
   *
   * @param state     the initial state
   * @param steppable the update algorithm and distance metric
   * @param dt        the initial value to use for dt
   * @returns the selected timestep that has acceptable error or meets the minimum allowed
   */
  getTimestep( state, steppable, dt ) {
    if ( dt < this.minDT ) {
      console.log( 'Time step too small: ' + dt );
      return this.minDT;
    }
    else if ( this.errorAcceptable( state, steppable, dt ) ) {
      return dt;
    }
    else {
      return this.getTimestep( state, steppable, dt / 2 );
    }
  }

  errorAcceptable( state, steppable, dt ) {
    const a = steppable.update( state, dt );
    const b1 = steppable.update( state, dt / 2 );
    const b2 = steppable.update( b1, dt / 2 );
    const distance = steppable.distance( a, b2 );
    assert && assert( !isNaN( distance ), 'distance should be numeric' );
    return distance < this.errorThreshold;
  }
}

circuitConstructionKitCommon.register( 'TimestepSubdivisions', TimestepSubdivisions );
export default TimestepSubdivisions;