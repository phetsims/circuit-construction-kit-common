// Copyright 2021, University of Colorado Boulder
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import ResultSet from './ResultSet.js';
import MNACircuitElement from './mna/MNACircuitElement.js';
import LTAState from './LTAState.js';
import CoreModel from './CoreModel.js';
import MNAResistor from './mna/MNAResistor.js';

/**
 * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
 * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct
 * dynamics (using instantaneous solutions) but also to show intermediate states (using the average results), see #2270.
 */
class CircuitResult {

  readonly resultSet: ResultSet<LTAState>;

  /**
   * @param {ResultSet.<LTACircuit.LTAState>} resultSet
   */
  constructor( resultSet: ResultSet<LTAState> ) {
    // @public
    this.resultSet = resultSet;
  }

  /**
   * The time averaged current is used to show transient values in current, such as a current spike when a battery+
   * capacitor (no resistance) circuit is wired up, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
   * @param {MNACircuitElement} element
   * @returns {number}
   * @public
   */
  getTimeAverageCurrent( element: MNACircuitElement ) {
    let weightedSum = 0.0;
    this.resultSet.states.forEach( ( stateObject: any ) => {
      weightedSum += stateObject.state.dynamicCircuitSolution.getCurrent( element ) * stateObject.dt;
    } );
    const number = weightedSum / this.resultSet.getTotalTime();
    assert && assert( !isNaN( number ) );
    return number;
  }

  // @public
  getTimeAverageCurrentForCoreModel( element: CoreModel ) {
    let weightedSum = 0.0;
    this.resultSet.states.forEach( ( stateObject: any ) => {
      weightedSum += stateObject.state.dynamicCircuitSolution.getCurrentForCompanion( element ) * stateObject.dt;
    } );
    const number = weightedSum / this.resultSet.getTotalTime();
    assert && assert( !isNaN( number ) );
    return number;
  }

  /**
   * The instantaneous current is used for computing the next modified nodal analysis state and integration.
   * @param {MNACircuitElement} element
   * @returns {number}
   * @public
   */
  getInstantaneousCurrent( element: MNAResistor ) {
    return this.getFinalState().dynamicCircuitSolution!.getCurrent( element );
  }

  /**
   * @param {MNACircuitElement} element
   * @returns {number}
   * @public
   */
  getInstantaneousVoltage( element: MNACircuitElement ) {
    return this.getFinalState().dynamicCircuitSolution!.getVoltage( element.nodeId0, element.nodeId1 );
  }

  // @public
  getInstantaneousVoltageForCoreModel( coreModel: CoreModel ): number {
    return this.getFinalState().dynamicCircuitSolution!.getVoltage( coreModel.node0, coreModel.node1 );
  }

  // @public
  getInstantaneousCurrentForCoreModel( coreModel: CoreModel ): number {
    return this.getFinalState().dynamicCircuitSolution!.getCurrentForCompanion( coreModel );
  }

  /**
   * @returns {LTAState}
   * @public
   */
  getFinalState() {
    return this.resultSet.getFinalState();
  }
}

circuitConstructionKitCommon.register( 'CircuitResult', CircuitResult );

export default CircuitResult;