// Copyright 2019-2021, University of Colorado Boulder

/**
 * There are two parts to solving a dynamic circuit:
 * 1. Splitting up dynamic components such as capacitors and inductors into their respective linear companion models.
 * 2. Adjusting the dt so that integration steps are accurate.  This is done through TimestepSubdivisions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CircuitResult from './CircuitResult.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ModifiedNodalAnalysisCircuit from './ModifiedNodalAnalysisCircuit.js';
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import TimestepSubdivisions from './TimestepSubdivisions.js';
import DynamicCircuitSolution from './DynamicCircuitSolution.js';
import DynamicState from './DynamicState.js';
import DynamicElementState from './DynamicElementState.js';
import DynamicInductor from './DynamicInductor.js';
import DynamicCapacitor from './DynamicCapacitor.js';
import ResistorAdapter from './ResistorAdapter.js';
import ResistiveBatteryAdapter from './ResistiveBatteryAdapter.js';
import CapacitorAdapter from './CapacitorAdapter.js';
import InductorAdapter from './InductorAdapter.js';
import ModifiedNodalAnalysisSolution from './ModifiedNodalAnalysisSolution';

class DynamicCircuit {
  resistorAdapters: ResistorAdapter[];
  resistiveBatteryAdapters: ResistiveBatteryAdapter[];
  capacitorAdapters: CapacitorAdapter[];
  inductorAdapters: InductorAdapter[];

  /**
   * @param {ResistorAdapter[]} resistorAdapters
   * @param {ResistiveBatteryAdapter[]} resistiveBatteryAdapters
   * @param {CapacitorAdapter[]} capacitorAdapters
   * @param {InductorAdapter[]} inductorAdapters
   */
  constructor( resistorAdapters: ResistorAdapter[], resistiveBatteryAdapters: ResistiveBatteryAdapter[], capacitorAdapters: CapacitorAdapter[], inductorAdapters: InductorAdapter[] ) {

    // @private
    this.resistorAdapters = resistorAdapters;
    this.resistiveBatteryAdapters = resistiveBatteryAdapters;
    this.capacitorAdapters = capacitorAdapters;
    this.inductorAdapters = inductorAdapters;
  }

  /**
   * Solving the companion model is the same as propagating forward in time by dt.
   *
   * @param {number} dt
   * @returns {DynamicCircuitSolution}
   * @public
   */
  solvePropagate( dt: number ) {

    const companionBatteries: ModifiedNodalAnalysisCircuitElement[] = [];
    const companionResistors: ModifiedNodalAnalysisCircuitElement[] = [];
    const currentCompanions: { element: any, getValueForSolution: any }[] = [];

    // Node indices that have been used
    let syntheticNodeIndex = 0;

    // Each resistive battery is a resistor in series with a battery
    this.resistiveBatteryAdapters.forEach( resistiveBatteryAdapter => {
      const newNode = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;

      const idealBattery = new ModifiedNodalAnalysisCircuitElement( resistiveBatteryAdapter.nodeId0, newNode, null, resistiveBatteryAdapter.voltage ); // final LinearCircuitSolver.Battery
      const idealResistor = new ModifiedNodalAnalysisCircuitElement( newNode, resistiveBatteryAdapter.nodeId1, null, resistiveBatteryAdapter.resistance ); // LinearCircuitSolver.Resistor
      companionBatteries.push( idealBattery );
      companionResistors.push( idealResistor );

      // We need to be able to get the current for this component
      currentCompanions.push( {
        element: resistiveBatteryAdapter,
        getValueForSolution: ( solution: ModifiedNodalAnalysisSolution ) => idealBattery.currentSolution
      } );
    } );

    // Add companion models for capacitor

    // TRAPEZOIDAL: battery and resistor in series.
    // We use trapezoidal rather than backward Euler because we do not model current sources and it seems to work well.
    // See http://circsimproj.blogspot.com/2009/07/companion-models.html
    // Veq = V + dt*I/2/C;
    // Req = dt/2/C
    this.capacitorAdapters.forEach( capacitorAdapter => {
      assert && assert( capacitorAdapter instanceof DynamicCapacitor, 'Should have been DynamicCapacitor' );
      assert && assert( capacitorAdapter.dynamicCircuitCapacitor.capacitance >= 0, 'capacitance should be non-negative' );
      assert && assert( dt >= 0, 'dt should be non-negative' );

      const newNode1 = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;
      const newNode2 = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;

      const companionResistance = dt / 2.0 / capacitorAdapter.dynamicCircuitCapacitor.capacitance;
      const resistanceTerm = CCKCQueryParameters.capacitorResistance;

      // The capacitor is modeled as a battery in series with a resistor.  Hence the voltage drop across the capacitor
      // is equal to the voltage drop across the battery plus the voltage drop across the resistor.
      // V = Vbattery + Vresistor.  We need to solve for the voltage across the battery to use it in the companion
      // model, so we have Vbattery = V-Vresistor.  The magnitude of the voltage drop across the resistor is given by
      // |V|=|IReq| and sign is unchanged since the conventional current flows from high to low voltage.
      const companionVoltage = capacitorAdapter.state.voltage - companionResistance * capacitorAdapter.state.current;

      const battery = new ModifiedNodalAnalysisCircuitElement( capacitorAdapter.dynamicCircuitCapacitor.nodeId0, newNode1, null, companionVoltage );
      const resistor = new ModifiedNodalAnalysisCircuitElement( newNode1, newNode2, null, companionResistance );
      const resistor2 = new ModifiedNodalAnalysisCircuitElement( newNode2, capacitorAdapter.dynamicCircuitCapacitor.nodeId1, null, resistanceTerm );

      companionBatteries.push( battery );
      companionResistors.push( resistor );
      companionResistors.push( resistor2 );

      capacitorAdapter.capacitorVoltageNode0 = capacitorAdapter.dynamicCircuitCapacitor.nodeId0;
      capacitorAdapter.capacitorVoltageNode1 = newNode2;

      // We need to be able to get the current for this component. In series, so the current is the same through both.
      currentCompanions.push( {
        element: capacitorAdapter,
        getValueForSolution: ( solution: ModifiedNodalAnalysisSolution ) => solution.getCurrentForResistor( resistor )
      } );
    } );

    // See also http://circsimproj.blogspot.com/2009/07/companion-models.html, which reports:
    // Req = 2L/dt
    // Veq = -2Li/dt-v
    // See najm page 279 and Pillage page 86
    this.inductorAdapters.forEach( inductorAdapter => {
      const inductor = inductorAdapter.dynamicCircuitInductor;

      // In series
      const newNode = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;

      const companionResistance = 2 * inductor.inductance / dt;
      const companionVoltage = -inductorAdapter.state.voltage - companionResistance * inductorAdapter.state.current;

      const battery = new ModifiedNodalAnalysisCircuitElement( inductor.nodeId0, newNode, null, companionVoltage );
      const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId1, null, companionResistance );
      companionBatteries.push( battery );
      companionResistors.push( resistor );

      // we need to be able to get the current for this component
      // in series, so current is same through both companion components
      currentCompanions.push( {
        element: inductorAdapter,
        getValueForSolution: ( solution: ModifiedNodalAnalysisSolution ) => -solution.getCurrentForResistor( resistor )
      } );
    } );

    const newBatteryList = companionBatteries;
    const newResistorList = [ ...this.resistorAdapters, ...companionResistors ];
    const newCurrentList: ModifiedNodalAnalysisCircuitElement[] = []; // Placeholder for if we add other circuit elements in the future

    const mnaCircuit = new ModifiedNodalAnalysisCircuit( newBatteryList, newResistorList, newCurrentList );

    const mnaSolution = mnaCircuit.solve();
    return new DynamicCircuitSolution( this, mnaSolution, currentCompanions );
  }

  /**
   * @param {TimestepSubdivisions} timestepSubdivisions
   * @param {number} dt
   * @returns {CircuitResult}
   * @public
   */
  solveWithSubdivisions( timestepSubdivisions: TimestepSubdivisions<DynamicState>, dt: number ) {
    CCKCUtils.clearAccumulatedSteps();
    const steppable = {

      // TODO: types
      update: ( a: { update: ( arg0: any ) => any; }, dt: any ) => a.update( dt ),
      distance: ( a: { getCharacteristicArray: () => number[]; }, b: { getCharacteristicArray: () => number[]; } ) => euclideanDistance( a.getCharacteristicArray(), b.getCharacteristicArray() )
    };

    // Turning the error threshold too low here can fail the inductor tests in MNATestCase
    const x = timestepSubdivisions.stepInTimeWithHistory( new DynamicState( this, null ), steppable, dt );
    return new CircuitResult( x );
  }

  /**
   * @param {number} dt
   * @returns {CircuitResult}
   * @private
   */
  solveWithSubdivisions2( dt: number ) {
    return this.solveWithSubdivisions( new TimestepSubdivisions(), dt );
  }

  /**
   * @param {number} dt
   * @returns {DynamicCircuit}
   * @private
   */
  updateWithSubdivisions( dt: number ) {
    return this.solveWithSubdivisions2( dt ).getFinalState().dynamicCircuit;
  }

  /**
   * @param {number} dt
   * @returns {DynamicCircuitSolution}
   * @public (unit-tests)
   */
  solveItWithSubdivisions( dt: number ) {
    return this.solveWithSubdivisions2( dt ).getFinalState().dynamicCircuitSolution;
  }

  /**
   * @param {number} dt
   * @returns {DynamicCircuit}
   * @public
   */
  update( dt: number ) {
    return this.updateCircuit( this.solvePropagate( dt ) );
  }

  /**
   * Applies the specified solution to the circuit.
   *
   * @param {DynamicCircuitSolution} solution
   * @returns {DynamicCircuit}
   * @public
   */
  updateCircuit( solution: DynamicCircuitSolution ) {
    const updatedCapacitors = this.capacitorAdapters.map( capacitorAdapter => {
      const newState = new DynamicElementState(
        // @ts-ignore
        solution.getNodeVoltage( capacitorAdapter.capacitorVoltageNode1 ) - solution.getNodeVoltage( capacitorAdapter.capacitorVoltageNode0 ),
        solution.getCurrent( capacitorAdapter )
      );
      return new DynamicCapacitor( capacitorAdapter.dynamicCircuitCapacitor, newState );
    } );
    const updatedInductors = this.inductorAdapters.map( inductorAdapter => {
      const newState = new DynamicElementState(
        solution.getNodeVoltage( inductorAdapter.dynamicCircuitInductor.nodeId1 ) - solution.getNodeVoltage( inductorAdapter.dynamicCircuitInductor.nodeId0 ),
        solution.getCurrent( inductorAdapter )
      );
      return new DynamicInductor( inductorAdapter.dynamicCircuitInductor, newState );
    } );

    // @ts-ignore
    return new DynamicCircuit( this.resistorAdapters, this.resistiveBatteryAdapters, updatedCapacitors, updatedInductors );
  }
}

/**
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number}
 */
const euclideanDistance = ( x: number[], y: number[] ) => {
  assert && assert( x.length === y.length, 'Vector length mismatch' );
  let sumSqDiffs = 0;
  for ( let i = 0; i < x.length; i++ ) {
    sumSqDiffs += Math.pow( x[ i ] - y[ i ], 2 );
  }
  return Math.sqrt( sumSqDiffs );
};

circuitConstructionKitCommon.register( 'DynamicCircuit', DynamicCircuit );
export default DynamicCircuit;