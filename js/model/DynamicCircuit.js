// Copyright 2019-2021, University of Colorado Boulder

/**
 * There are two parts to solving a dynamic circuit:
 * 1. Splitting up dynamic components such as capacitors and inductors into their respective linear companion models.
 * 2. Adjusting the dt so that integration steps are accurate.  This is done through TimestepSubdivisions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ModifiedNodalAnalysisCircuit from './ModifiedNodalAnalysisCircuit.js';
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import TimestepSubdivisions from './TimestepSubdivisions.js';

class DynamicCircuit {

  /**
   * @param {ResistorAdapter[]} resistorAdapters
   * @param {ResistiveBatteryAdapter[]} resistiveBatteryAdapters
   * @param {CapacitorAdapter[]} capacitorAdapters
   * @param {InductorAdapter[]} inductorAdapters
   */
  constructor( resistorAdapters, resistiveBatteryAdapters, capacitorAdapters, inductorAdapters ) {

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
  solvePropagate( dt ) {

    const companionBatteries = []; // {ModifiedNodalAnalysisCircuitElement[]}
    const companionResistors = []; // {ModifiedNodalAnalysisCircuitElement[]}
    const currentCompanions = []; // {ModifiedNodalAnalysisCircuitElement[]}

    // Node indices that have been used
    const usedNodes = [];

    this.capacitorAdapters.forEach( capacitorAdapter => {
      usedNodes.push( capacitorAdapter.dynamicCircuitCapacitor.nodeId0 );
      usedNodes.push( capacitorAdapter.dynamicCircuitCapacitor.nodeId1 );
    } );

    this.inductorAdapters.forEach( inductorAdapter => {
      usedNodes.push( inductorAdapter.dynamicCircuitInductor.nodeId0 );
      usedNodes.push( inductorAdapter.dynamicCircuitInductor.nodeId1 );
    } );

    [ ...this.resistorAdapters, ...this.resistiveBatteryAdapters ].forEach( element => {
      usedNodes.push( element.nodeId0 );
      usedNodes.push( element.nodeId1 );
    } );

    // Each resistive battery is a resistor in series with a battery
    this.resistiveBatteryAdapters.forEach( resistiveBatteryAdapter => {
      const newNode = _.max( usedNodes ) + 1;
      usedNodes.push( newNode );

      const idealBattery = new ModifiedNodalAnalysisCircuitElement( resistiveBatteryAdapter.nodeId0, newNode, null, resistiveBatteryAdapter.voltage ); // final LinearCircuitSolver.Battery
      const idealResistor = new ModifiedNodalAnalysisCircuitElement( newNode, resistiveBatteryAdapter.nodeId1, null, resistiveBatteryAdapter.resistance ); // LinearCircuitSolver.Resistor
      companionBatteries.push( idealBattery );
      companionResistors.push( idealResistor );

      // We need to be able to get the current for this component
      currentCompanions.push( {
        element: resistiveBatteryAdapter,
        getValueForSolution: solution => idealBattery.currentSolution
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

      const newNode1 = _.max( usedNodes ) + 1;
      usedNodes.push( newNode1 );

      const newNode2 = _.max( usedNodes ) + 1;
      usedNodes.push( newNode2 );

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
        getValueForSolution: solution => solution.getCurrentForResistor( resistor )
      } );
    } );

    // See also http://circsimproj.blogspot.com/2009/07/companion-models.html, which reports:
    // Req = 2L/dt
    // Veq = -2Li/dt-v
    // See najm page 279 and Pillage page 86
    this.inductorAdapters.forEach( inductorAdapter => {
      const inductor = inductorAdapter.dynamicCircuitInductor;

      // In series
      const newNode = _.max( usedNodes ) + 1;
      usedNodes.push( newNode );

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
        getValueForSolution: solution => -solution.getCurrentForResistor( resistor )
      } );
    } );

    const newBatteryList = companionBatteries;
    const newResistorList = [ ...this.resistorAdapters, ...companionResistors ];
    const newCurrentList = []; // Placeholder for if we add other circuit elements in the future

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
  solveWithSubdivisions( timestepSubdivisions, dt ) {
    CCKCUtils.clearAccumulatedSteps();
    const steppable = {
      update: ( a, dt ) => a.update( dt ),
      distance: ( a, b ) => euclideanDistance( a.getCharacteristicArray(), b.getCharacteristicArray() )
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
  solveWithSubdivisions2( dt ) {
    return this.solveWithSubdivisions( new TimestepSubdivisions(), dt );
  }

  /**
   * @param {number} dt
   * @returns {DynamicCircuit}
   * @private
   */
  updateWithSubdivisions( dt ) {
    return this.solveWithSubdivisions2( dt ).getFinalState().dynamicCircuit;
  }

  /**
   * @param {number} dt
   * @returns {DynamicCircuitSolution}
   * @public (unit-tests)
   */
  solveItWithSubdivisions( dt ) {
    return this.solveWithSubdivisions2( dt ).getFinalState().dynamicCircuitSolution;
  }

  /**
   * @param {number} dt
   * @returns {DynamicCircuit}
   * @public
   */
  update( dt ) {
    return this.updateCircuit( this.solvePropagate( dt ) );
  }

  /**
   * Applies the specified solution to the circuit.
   *
   * @param {DynamicCircuitSolution} solution
   * @returns {DynamicCircuit}
   * @public
   */
  updateCircuit( solution ) {
    const updatedCapacitors = this.capacitorAdapters.map( capacitorAdapter => {
      const newState = new DynamicElementState(
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
    return new DynamicCircuit( this.resistorAdapters, this.resistiveBatteryAdapters, updatedCapacitors, updatedInductors );
  }
}

/**
 * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
 * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct
 * dynamics (using instantaneous solutions) but also to show intermediate states (using the average results), see #2270.
 */
class CircuitResult {

  /**
   * @param {ResultSet.<DynamicCircuit.DynamicState>} resultSet
   */
  constructor( resultSet ) {
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
  getTimeAverageCurrent( element ) {
    let weightedSum = 0.0;
    this.resultSet.states.forEach( stateObject => {
      weightedSum += stateObject.state.dynamicCircuitSolution.getCurrent( element ) * stateObject.subdivisionDT;
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
  getInstantaneousCurrent( element ) {
    return this.getFinalState().dynamicCircuitSolution.getCurrent( element );
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getInstantaneousVoltage( element ) {
    return this.getFinalState().dynamicCircuitSolution.getVoltage( element );
  }

  /**
   * @returns {DynamicState}
   * @private
   */
  getFinalState() {
    return this.resultSet.getFinalState();
  }
}

class DynamicCapacitor {

  /**
   * @param {DynamicCircuit.Capacitor} dynamicCircuitCapacitor
   * @param {DynamicElementState} state
   */
  constructor( dynamicCircuitCapacitor, state ) {

    // @public {DynamicCircuit.Capacitor}
    this.dynamicCircuitCapacitor = dynamicCircuitCapacitor;

    // @public {DynamicElementState}
    this.state = state;

    // @public placeholders for where to read the capacitor part of the voltage without the series resistor
    this.capacitorVoltageNode0 = null;
    this.capacitorVoltageNode1 = null;
  }
}

class DynamicInductor {

  /**
   * @param {DynamicCircuit.Inductor} dynamicCircuitInductor
   * @param {DynamicElementState} state
   */
  constructor( dynamicCircuitInductor, state ) {

    // @public {Inductor}
    this.dynamicCircuitInductor = dynamicCircuitInductor;

    // @public {DynamicElementState}
    this.state = state;
  }
}

class Capacitor extends ModifiedNodalAnalysisCircuitElement {
  /**
   * @param {number} node0
   * @param {number} node1
   * @param {number} capacitance
   */
  constructor( node0, node1, capacitance ) {
    super( node0, node1, null, 0 );

    // @public
    this.capacitance = capacitance;
  }
}

class Inductor extends ModifiedNodalAnalysisCircuitElement {
  /**
   * @param {number} node0
   * @param {number} node1
   * @param {number} inductance
   */
  constructor( node0, node1, inductance ) {
    super( node0, node1, null, 0 );

    // @public
    this.inductance = inductance;
  }
}

class ResistiveBattery extends ModifiedNodalAnalysisCircuitElement {
  /**
   * @param {number} node0
   * @param {number} node1
   * @param {number} voltage
   * @param {number} resistance
   */
  constructor( node0, node1, voltage, resistance ) {
    super( node0, node1, null, 0 );

    // @public
    this.voltage = voltage;

    // @public
    this.resistance = resistance;
  }
}

/**
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number}
 */
const euclideanDistance = ( x, y ) => {
  assert && assert( x.length === y.length, 'Vector length mismatch' );
  let sumSqDiffs = 0;
  for ( let i = 0; i < x.length; i++ ) {
    sumSqDiffs += Math.pow( x[ i ] - y[ i ], 2 );
  }
  return Math.sqrt( sumSqDiffs );
};

class DynamicElementState {

  /**
   * @param {number} voltage - the voltage drop v1-v0
   * @param {number} current - the conventional current as it moves from node 0 to node 1
   */
  constructor( voltage, current ) {
    // @public
    this.voltage = voltage;
    this.current = current;
  }
}

class DynamicState {

  /**
   * @param {DynamicCircuit} dynamicCircuit
   * @param {DynamicCircuitSolution|null} dynamicCircuitSolution
   */
  constructor( dynamicCircuit, dynamicCircuitSolution ) {
    assert && assert( dynamicCircuit, 'circuit should be defined' );

    // @public (read-only)
    this.dynamicCircuit = dynamicCircuit;

    // @public (read-only)
    this.dynamicCircuitSolution = dynamicCircuitSolution;
  }

  /**
   * @param {number} dt
   * @returns {DynamicState}
   * @public
   */
  update( dt ) {
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
    for ( let i = 0; i < this.dynamicCircuit.capacitorAdapters.length; i++ ) {
      currents.push( this.dynamicCircuit.capacitorAdapters[ i ].state.current );
    }
    for ( let i = 0; i < this.dynamicCircuit.inductorAdapters.length; i++ ) {
      currents.push( this.dynamicCircuit.inductorAdapters[ i ].state.current );
    }
    return currents;
  }
}

class DynamicCircuitSolution {

  /**
   * @param {DynamicCircuit} circuit
   * @param {ModifiedNodalAnalysisSolution} mnaSolution
   * @param {{element:ModifiedNodalAnalysisCircuitElement,getValueForSolution(ModifiedNodalAnalysisSolution):number}[]} currentCompanions
   * @constructor
   */
  constructor( circuit, mnaSolution, currentCompanions ) {
    // @public
    this.circuit = circuit;
    this.mnaSolution = mnaSolution;
    this.currentCompanions = currentCompanions;
  }

  /**
   * @param {number} nodeIndex - index
   * @returns {number}
   * @public
   */
  getNodeVoltage( nodeIndex ) {
    return this.mnaSolution.getNodeVoltage( nodeIndex );
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement|CapacitorAdapter|InductorAdapter} element
   * @returns {number}
   * @public
   */
  getCurrent( element ) {

    // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
    // 0-resistance battery), the current is given by the matrix solution.
    if ( element.hasOwnProperty( 'currentSolution' ) && element.currentSolution !== null ) {
      return element.currentSolution;
    }

    // Support
    const companion = _.find( this.currentCompanions, c => c.element === element ||
                                                           c.element.dynamicCircuitCapacitor === element ||
                                                           c.element.dynamicCircuitInductor === element );

    if ( companion ) {
      return companion.getValueForSolution( this.mnaSolution );
    }
    else {
      return this.mnaSolution.getCurrentForResistor( element );
    }
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getVoltage( element ) {
    return this.getNodeVoltage( element.nodeId1 ) - this.getNodeVoltage( element.nodeId0 );
  }
}

// @public
DynamicCircuit.Capacitor = Capacitor;
DynamicCircuit.Inductor = Inductor;
DynamicCircuit.DynamicElementState = DynamicElementState;
DynamicCircuit.DynamicCapacitor = DynamicCapacitor;
DynamicCircuit.DynamicInductor = DynamicInductor;
DynamicCircuit.ResistiveBattery = ResistiveBattery;

circuitConstructionKitCommon.register( 'DynamicCircuit', DynamicCircuit );
export default DynamicCircuit;