// Copyright 2019-2021, University of Colorado Boulder

/**
 * There are two parts to solving a dynamic circuit:
 * 1. Splitting up dynamic components such as capacitors and inductors into their respective linear companion models.
 * 2. Adjusting the dt so that integration steps are accurate.  This is done through TimestepSubdivisions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCQueryParameters from '../../CCKCQueryParameters.js';
import CircuitResult from './CircuitResult.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import ModifiedNodalAnalysisCircuit from './mna/ModifiedNodalAnalysisCircuit.js';
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';
import TimestepSubdivisions from './TimestepSubdivisions.js';
import DynamicCircuitSolution from './DynamicCircuitSolution.js';
import DynamicState from './DynamicState.js';
import DynamicElementState from './DynamicElementState.js';
import DynamicInductor from './DynamicInductor.js';
import DynamicCapacitor from './DynamicCapacitor.js';
import ModifiedNodalAnalysisSolution from './mna/ModifiedNodalAnalysisSolution.js';
import DynamicCircuitResistiveBattery from './DynamicCircuitResistiveBattery.js';

class DynamicCircuit {
  private readonly resistorAdapters: ModifiedNodalAnalysisCircuitElement[];
  private readonly resistiveBatteryAdapters: DynamicCircuitResistiveBattery[];
  readonly dynamicCapacitors: DynamicCapacitor[];
  readonly dynamicInductors: DynamicInductor[];

  /**
   * @param {ModifiedNodalAnalysisCircuitElement[]} resistorAdapters
   * @param {DynamicCircuitResistiveBattery[]} resistiveBatteryAdapters
   * @param {DynamicCapacitor[]} dynamicCapacitors
   * @param {DynamicInductor[]} dynamicInductors
   */
  constructor( resistorAdapters: ModifiedNodalAnalysisCircuitElement[],
               resistiveBatteryAdapters: DynamicCircuitResistiveBattery[],
               dynamicCapacitors: DynamicCapacitor[],
               dynamicInductors: DynamicInductor[] ) {

    // @private
    this.resistorAdapters = resistorAdapters;
    this.resistiveBatteryAdapters = resistiveBatteryAdapters;
    this.dynamicCapacitors = dynamicCapacitors;
    this.dynamicInductors = dynamicInductors;
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

      const idealBattery = new ModifiedNodalAnalysisCircuitElement( resistiveBatteryAdapter.node0, newNode, null, resistiveBatteryAdapter.voltage ); // final LinearCircuitSolver.Battery
      const idealResistor = new ModifiedNodalAnalysisCircuitElement( newNode, resistiveBatteryAdapter.node1, null, resistiveBatteryAdapter.resistance ); // LinearCircuitSolver.Resistor
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
    this.dynamicCapacitors.forEach( dynamicCapacitor => {
      assert && assert( dt >= 0, 'dt should be non-negative' );

      const newNode1 = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;
      const newNode2 = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;

      const companionResistance = dt / 2.0 / dynamicCapacitor.capacitance;
      const resistanceTerm = CCKCQueryParameters.capacitorResistance;

      // The capacitor is modeled as a battery in series with a resistor.  Hence the voltage drop across the capacitor
      // is equal to the voltage drop across the battery plus the voltage drop across the resistor.
      // V = Vbattery + Vresistor.  We need to solve for the voltage across the battery to use it in the companion
      // model, so we have Vbattery = V-Vresistor.  The magnitude of the voltage drop across the resistor is given by
      // |V|=|IReq| and sign is unchanged since the conventional current flows from high to low voltage.
      const companionVoltage = dynamicCapacitor.state.voltage - companionResistance * dynamicCapacitor.state.current;

      const battery = new ModifiedNodalAnalysisCircuitElement( dynamicCapacitor.node0, newNode1, null, companionVoltage );
      const resistor = new ModifiedNodalAnalysisCircuitElement( newNode1, newNode2, null, companionResistance );
      const resistor2 = new ModifiedNodalAnalysisCircuitElement( newNode2, dynamicCapacitor.node1, null, resistanceTerm );

      companionBatteries.push( battery );
      companionResistors.push( resistor );
      companionResistors.push( resistor2 );

      dynamicCapacitor.capacitorVoltageNode0 = dynamicCapacitor.node0;
      dynamicCapacitor.capacitorVoltageNode1 = newNode2;

      // We need to be able to get the current for this component. In series, so the current is the same through both.
      currentCompanions.push( {
        element: dynamicCapacitor,
        getValueForSolution: ( solution: ModifiedNodalAnalysisSolution ) => solution.getCurrentForResistor( resistor )
      } );
    } );

    // See also http://circsimproj.blogspot.com/2009/07/companion-models.html, which reports:
    // Req = 2L/dt
    // Veq = -2Li/dt-v
    // See najm page 279 and Pillage page 86
    this.dynamicInductors.forEach( dynamicInductor => {

      // In series
      const newNode = 'syntheticNode' + syntheticNodeIndex;
      syntheticNodeIndex++;

      const companionResistance = 2 * dynamicInductor.inductance / dt;
      const companionVoltage = -dynamicInductor.state.voltage - companionResistance * dynamicInductor.state.current;
      // TODO: this is how it appears in Java https://github.com/phetsims/circuit-construction-kit-common/issues/758
      // const companionVoltage = dynamicInductor.state.voltage + companionResistance * dynamicInductor.state.current;

      const battery = new ModifiedNodalAnalysisCircuitElement( dynamicInductor.node0, newNode, null, companionVoltage );
      const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, dynamicInductor.node1, null, companionResistance );
      companionBatteries.push( battery );
      companionResistors.push( resistor );

      // we need to be able to get the current for this component
      // in series, so current is same through both companion components
      currentCompanions.push( {
        element: dynamicInductor,
        // TODO: This sign looks very wrong https://github.com/phetsims/circuit-construction-kit-common/issues/758
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
    const updatedCapacitors = this.dynamicCapacitors.map( dynamicCapacitor => {
      const newState = new DynamicElementState(
        // TODO: This may have something to do with it?  https://github.com/phetsims/circuit-construction-kit-common/issues/758
        solution.getNodeVoltage( dynamicCapacitor.capacitorVoltageNode1! ) - solution.getNodeVoltage( dynamicCapacitor.capacitorVoltageNode0! ),
        solution.getCurrentForCapacitor( dynamicCapacitor )
      );
      return new DynamicCapacitor( dynamicCapacitor.id, dynamicCapacitor.node0, dynamicCapacitor.node1, newState, dynamicCapacitor.capacitance );
    } );
    const updatedInductors = this.dynamicInductors.map( dynamicInductor => {
      const newState = new DynamicElementState(
        // TODO: This may have something to do with it? https://github.com/phetsims/circuit-construction-kit-common/issues/758
        solution.getNodeVoltage( dynamicInductor.node1 ) - solution.getNodeVoltage( dynamicInductor.node0 ),
        solution.getCurrentForInductor( dynamicInductor )
      );
      return new DynamicInductor( dynamicInductor.id, dynamicInductor.node0, dynamicInductor.node1, newState, dynamicInductor.inductance );
    } );

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