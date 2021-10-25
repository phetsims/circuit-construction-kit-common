// Copyright 2021, University of Colorado Boulder
import LTACircuit from './LTACircuit.js';
import LTASolution from './LTASolution.js';

class LTAState {
  readonly dynamicCircuit: LTACircuit;
  readonly dynamicCircuitSolution: LTASolution | null;
  private solution: LTASolution | null;

  constructor( dynamicCircuit: LTACircuit, dynamicCircuitSolution: LTASolution | null ) {
    this.dynamicCircuit = dynamicCircuit;
    this.dynamicCircuitSolution = dynamicCircuitSolution;
    this.solution = null;
  }

  /**
   * @param {number} dt
   * @returns {LTAState}
   * @public
   */
  update( dt: number ) {
    this.solution = this.dynamicCircuit.solvePropagate( dt );
    const newCircuit = this.dynamicCircuit.updateCircuit( this.solution );
    return new LTAState( newCircuit, this.solution );
  }

  /**
   * Returns an array of characteristic measurements from the solution, in order to determine whether more subdivisions
   * are needed in the timestep.
   * @returns {number[]}
   * @public
   */
  getCharacteristicArray() {

    // The solution has been applied to the this.dynamicCircuit, so we can read values from it
    const currents = [];
    for ( let i = 0; i < this.dynamicCircuit.dynamicCapacitors.length; i++ ) {
      currents.push( this.dynamicCircuit.dynamicCapacitors[ i ].current );
    }
    for ( let i = 0; i < this.dynamicCircuit.dynamicInductors.length; i++ ) {
      currents.push( this.dynamicCircuit.dynamicInductors[ i ].current );
    }
    return currents;
  }
}

export default LTAState;