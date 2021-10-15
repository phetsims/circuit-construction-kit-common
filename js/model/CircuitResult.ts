// Copyright 2021, University of Colorado Boulder
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ResultSet from './ResultSet.js';
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import DynamicState from './DynamicState.js';
import CapacitorAdapter from './CapacitorAdapter.js';
import InductorAdapter from './InductorAdapter.js';

/**
 * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
 * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct
 * dynamics (using instantaneous solutions) but also to show intermediate states (using the average results), see #2270.
 */
class CircuitResult {
  private readonly resultSet: ResultSet<DynamicState>;

  /**
   * @param {ResultSet.<DynamicCircuit.DynamicState>} resultSet
   */
  constructor( resultSet: ResultSet<DynamicState> ) {
    // @public
    this.resultSet = resultSet;
  }

  /**
   * The time averaged current is used to show transient values in current, such as a current spike when a battery+
   * capacitor (no resistance) circuit is wired up, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getTimeAverageCurrent( element: ModifiedNodalAnalysisCircuitElement | CapacitorAdapter | InductorAdapter ) {
    let weightedSum = 0.0;
    this.resultSet.states.forEach( stateObject => {
      // @ts-ignore
      weightedSum += stateObject.state.dynamicCircuitSolution.getCurrent( element ) * stateObject.dt;
    } );
    const number = weightedSum / this.resultSet.getTotalTime();
    assert && assert( !isNaN( number ) );
    return number;
  }

  /**
   * The instantaneous current is used for computing the next modified nodal analysis state and integration.
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getInstantaneousCurrent( element: ModifiedNodalAnalysisCircuitElement ) {
    // @ts-ignore
    return this.getFinalState().dynamicCircuitSolution.getCurrent( element );
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getInstantaneousVoltage( element: ModifiedNodalAnalysisCircuitElement ) {
    // @ts-ignore
    return this.getFinalState().dynamicCircuitSolution.getVoltage( element );
  }

  /**
   * @returns {DynamicState}
   * @public
   */
  getFinalState() {
    return this.resultSet.getFinalState();
  }
}

circuitConstructionKitCommon.register( 'CircuitResult', CircuitResult );

export default CircuitResult;