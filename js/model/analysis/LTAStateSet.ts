// Copyright 2021-2025, University of Colorado Boulder

/**
 * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
 * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct
 * dynamics (using instantaneous solutions) but also to show intermediate states (using the average results), see #2270.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type CoreModel from './CoreModel.js';
import type LTAState from './LTAState.js';
import type MNACircuitElement from './mna/MNACircuitElement.js';
import type MNAResistor from './mna/MNAResistor.js';

type Element = {
  dt: number;
  state: LTAState;
};
export default class LTAStateSet {

  private readonly resultSet: Element[];

  public constructor( resultSet: Element[] ) {
    this.resultSet = resultSet;
  }

  /**
   * The time averaged current is used to show transient values in current, such as a current spike when a battery+
   * capacitor (no resistance) circuit is wired up, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
   */
  public getTimeAverageCurrent( element: MNAResistor ): number {
    let weightedSum = 0.0;
    let totalTime = 0.0;
    this.resultSet.forEach( resultElement => {
      weightedSum += resultElement.state.ltaSolution!.getCurrent( element ) * resultElement.dt;
      totalTime += resultElement.dt;
    } );
    const number = weightedSum / totalTime;
    affirm( !isNaN( number ) );
    return number;
  }

  public getTimeAverageCurrentForCoreModel( element: CoreModel ): number {
    let weightedSum = 0.0;
    let totalTime = 0.0;
    this.resultSet.forEach( stateObject => {
      weightedSum += stateObject.state.ltaSolution!.getCurrentForCompanion( element ) * stateObject.dt;
      totalTime += stateObject.dt;
    } );
    const number = weightedSum / totalTime;
    affirm( !isNaN( number ) );
    return number;
  }

  /**
   * The instantaneous current is used for computing the next modified nodal analysis state and integration.
   */
  private getInstantaneousCurrent( element: MNAResistor ): number {
    return this.getFinalState().ltaSolution!.getCurrent( element );
  }

  private getInstantaneousVoltage( element: MNACircuitElement ): number {
    return this.getFinalState().ltaSolution!.getVoltage( element.nodeId0, element.nodeId1 );
  }

  public getInstantaneousVoltageForCoreModel( coreModel: CoreModel ): number {
    return this.getFinalState().ltaSolution!.getVoltage( coreModel.node0, coreModel.node1 );
  }

  public getInstantaneousCurrentForCoreModel( coreModel: CoreModel ): number {
    return this.getFinalState().ltaSolution!.getCurrentForCompanion( coreModel );
  }

  public getFinalState(): LTAState {
    return _.last( this.resultSet )!.state;
  }
}

circuitConstructionKitCommon.register( 'LTAStateSet', LTAStateSet );