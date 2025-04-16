// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type LTACircuit from './LTACircuit.js';
import type LTASolution from './LTASolution.js';
export default class LTAState {
  public readonly ltaCircuit: LTACircuit;
  public readonly ltaSolution: LTASolution | null;
  private solution: LTASolution | null;

  public constructor( ltaCircuit: LTACircuit, ltaSolution: LTASolution | null ) {
    this.ltaCircuit = ltaCircuit;
    this.ltaSolution = ltaSolution;
    this.solution = null;
  }

  public update( dt: number ): LTAState {
    this.solution = this.ltaCircuit.solvePropagate( dt );
    const newCircuit = this.ltaCircuit.updateCircuit( this.solution );
    return new LTAState( newCircuit, this.solution );
  }

  /**
   * Returns an array of characteristic measurements from the solution, in order to determine whether more subdivisions
   * are needed in the timestep.
   */
  public getCharacteristicArray(): number[] {

    // The solution has been applied to the this.dynamicCircuit, so we can read values from it
    const currents = [];
    for ( let i = 0; i < this.ltaCircuit.ltaCapacitors.length; i++ ) {
      currents.push( this.ltaCircuit.ltaCapacitors[ i ].current );
    }
    for ( let i = 0; i < this.ltaCircuit.ltaInductors.length; i++ ) {
      currents.push( this.ltaCircuit.ltaInductors[ i ].current );
    }
    return currents;
  }
}
circuitConstructionKitCommon.register( 'LTAState', LTAState );