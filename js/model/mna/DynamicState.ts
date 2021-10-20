// Copyright 2021, University of Colorado Boulder
import DynamicCircuit from './DynamicCircuit.js';
import DynamicCircuitSolution from './DynamicCircuitSolution.js';

class DynamicState {
  readonly dynamicCircuit: DynamicCircuit;
  readonly dynamicCircuitSolution: DynamicCircuitSolution | null;
  private solution: DynamicCircuitSolution | null;

  /**
   * @param {DynamicCircuit} dynamicCircuit
   * @param {DynamicCircuitSolution|null} dynamicCircuitSolution
   */
  constructor( dynamicCircuit: DynamicCircuit, dynamicCircuitSolution: DynamicCircuitSolution | null ) {
    assert && assert( dynamicCircuit, 'circuit should be defined' );

    // @public (read-only)
    this.dynamicCircuit = dynamicCircuit;

    // @public (read-only)
    this.dynamicCircuitSolution = dynamicCircuitSolution;

    this.solution = null;
  }

  /**
   * @param {number} dt
   * @returns {DynamicState}
   * @public
   */
  update( dt: number ) {
    this.solution = this.dynamicCircuit.solvePropagate( dt );
    const newCircuit = this.dynamicCircuit.updateCircuit( this.solution );
    return new DynamicState( newCircuit, this.solution );
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
      currents.push( this.dynamicCircuit.dynamicCapacitors[ i ].state.current );
    }
    for ( let i = 0; i < this.dynamicCircuit.dynamicInductors.length; i++ ) {
      currents.push( this.dynamicCircuit.dynamicInductors[ i ].state.current );
    }
    return currents;
  }
}

export default DynamicState;