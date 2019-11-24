// Copyright 2019, University of Colorado Boulder

/**
 * There are two parts to solving a dynamic circuit:
 * 1. Splitting up dynamic components such as capacitors and inductors into their respective linear companion models.
 * 2. Adjusting the dt so that integration steps are accurate.  This is done through TimestepSubdivisions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuit' );
  const ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  const TimestepSubdivisions = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/TimestepSubdivisions' );

  class DynamicCircuit {

    /**
     * @param {ResistorAdapter[]} resistors
     * @param {ResistiveBatteryAdapter[]} resistiveBatteries
     * @param {CapacitorAdapter[]} capacitors
     * @param {InductorAdapter[]} inductors
     */
    constructor( resistors, resistiveBatteries, capacitors, inductors ) {

      // @private
      this.resistors = resistors;
      this.resistiveBatteries = resistiveBatteries;
      this.capacitors = capacitors;
      this.inductors = inductors;
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
      const currentCompanions = [];

      // Node indices that have been used
      const usedNodes = [];

      this.capacitors.forEach( capacitorAdapter => {
        usedNodes.push( capacitorAdapter.capacitor.nodeId0 );
        usedNodes.push( capacitorAdapter.capacitor.nodeId1 );
      } );

      this.inductors.forEach( inductorAdapters => {
        usedNodes.push( inductorAdapters.inductor.nodeId0 );
        usedNodes.push( inductorAdapters.inductor.nodeId1 );
      } );

      [].concat( this.resistors, this.resistiveBatteries ).forEach( element => {
        usedNodes.push( element.nodeId0 );
        usedNodes.push( element.nodeId1 );
      } );

      // Each resistive battery is a resistor in series with a battery
      this.resistiveBatteries.forEach( resistiveBattery => {
        const newNode = _.max( usedNodes ) + 1;
        usedNodes.push( newNode );

        const idealBattery = new ModifiedNodalAnalysisCircuitElement( resistiveBattery.nodeId0, newNode, null, resistiveBattery.voltage ); // final LinearCircuitSolver.Battery
        const idealResistor = new ModifiedNodalAnalysisCircuitElement( newNode, resistiveBattery.nodeId1, null, resistiveBattery.resistance ); // LinearCircuitSolver.Resistor
        companionBatteries.push( idealBattery );
        companionResistors.push( idealResistor );

        // We need to be able to get the current for this component
        currentCompanions.push( {
          element: resistiveBattery,
          getValueForSolution: solution => idealBattery.currentSolution
        } );
      } );

      // Add companion models for capacitor

      // TRAPEZOIDAL: battery and resistor in series.
      // We use trapezoidal rather than backward Euler because we do not model current sources and it seems to work well.
      // See http://circsimproj.blogspot.com/2009/07/companion-models.html
      // Veq = V + dt*I/2/C;
      // Req = dt/2/C
      this.capacitors.forEach( dynamicCapacitor => {
        assert && assert( dynamicCapacitor instanceof DynamicCapacitor, 'Should have been DynamicCapacitor' );

        const newNode = _.max( usedNodes ) + 1;
        usedNodes.push( newNode );

        const companionResistance = dt / 2.0 / dynamicCapacitor.capacitor.capacitance;

        // TODO(sign-error): This sign contradicts the equation above, perhaps the current is backwards?
        // Flipping getValueForSolution and CapacitorAdapter.getTimeAverageCurrent seems to help
        const companionVoltage = dynamicCapacitor.state.voltage - companionResistance * dynamicCapacitor.state.current;

        const battery = new ModifiedNodalAnalysisCircuitElement( dynamicCapacitor.capacitor.nodeId0, newNode, null, companionVoltage );
        const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, dynamicCapacitor.capacitor.nodeId1, null, companionResistance );
        companionBatteries.push( battery );
        companionResistors.push( resistor );

        // We need to be able to get the current for this component. In series, so the current is the same through both.
        // TODO(sign-error): Previously used resistor to get current.  Check sign is correct.
        currentCompanions.push( {
          element: dynamicCapacitor,
          getValueForSolution: solution => solution.getCurrentForResistor( resistor )
        } );
      } );

      // See also http://circsimproj.blogspot.com/2009/07/companion-models.html
      // See najm page 279 and Pillage page 86
      this.inductors.forEach( dynamicInductor => {
        const inductor = dynamicInductor.inductor;

        // In series
        const newNode = _.max( usedNodes ) + 1;
        usedNodes.push( newNode );

        const companionResistance = 2 * inductor.inductance / dt;
        const companionVoltage = dynamicInductor.state.voltage + companionResistance * dynamicInductor.state.current;

        const battery = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId0, null, companionVoltage );
        const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId1, null, companionResistance );
        companionBatteries.push( battery );
        companionResistors.push( resistor );

        // we need to be able to get the current for this component
        // in series, so current is same through both companion components
        currentCompanions.push( {
          element: dynamicInductor,

          // TODO(sign-error): check sign, this was converted from battery to resistor
          getValueForSolution: solution => -solution.getCurrentForResistor( resistor )
        } );
      } );

      const newBatteryList = companionBatteries;
      const newResistorList = [].concat( this.resistors, companionResistors );
      const newCurrentList = []; // Placeholder for if we add other circuit elements in the future

      const mnaCircuit = new ModifiedNodalAnalysisCircuit( newBatteryList, newResistorList, newCurrentList );

      const mnaSolution = mnaCircuit.solve();
      return new DynamicCircuitSolution( this, mnaSolution, currentCompanions );
    }

    /**
     * @param {TimestepSubdivisions} timestepSubdivisions
     * @param {number} dt
     * @returns {CircuitResult}
     */
    solveWithSubdivisions( timestepSubdivisions, dt ) {
      const steppable = {
        update: ( a, dt ) => a.update( dt ),
        distance: ( a, b ) => euclideanDistance( a.getCharacteristicArray(), b.getCharacteristicArray() )
      };

      // Turning the error threshold too low here can fail the inductor tests in MNATestCase
      const x = timestepSubdivisions.stepInTimeWithHistory( new DynamicState( this, null ), steppable, dt );
      return new CircuitResult( x );
    }

    /**
     *
     * @param {number} dt
     * @returns MNAAdapter.CircuitResult
     */
    solveWithSubdivisions2( dt ) {
      return this.solveWithSubdivisions( new TimestepSubdivisions( 1E-6, 1E-8 ), dt );
    }

    /**
     * @param {number} dt
     * @returns DynamicCircuit
     */
    updateWithSubdivisions( dt ) {
      return this.solveWithSubdivisions2( dt ).getFinalState().dynamicCircuit;
    }

    /**
     * @param {number} dt
     * @returns DynamicCircuitSolution
     */
    solveItWithSubdivisions( dt ) {
      return this.solveWithSubdivisions2( dt ).getFinalState().dynamicCircuitSolution;
    }

    /**
     * @param {TimestepSubdivisions<DynamicState>} timestepSubdivisions
     * @param {number} dt
     * @returns DynamicCircuitSolution
     */
    solveItWithSubdivisions2( timestepSubdivisions, dt ) {
      return this.solveWithSubdivisions( timestepSubdivisions, dt ).getFinalState().dynamicCircuitSolution;
    }

    /**
     * @param {number} dt
     * @returns DynamicCircuit
     */
    update( dt ) {
      return this.updateCircuit( this.solvePropagate( dt ) );
    }

    /**
     * Applies the specified solution to the circuit.
     *
     * @param {DynamicCircuitSolution} solution
     * @returns {DynamicCircuit}
     */
    updateCircuit( solution ) {
      const updatedCapacitors = this.capacitors.map( capacitor => {
        const dynamicElementState = new DynamicElementState(
          solution.getNodeVoltage( capacitor.capacitor.nodeId1 ) - solution.getNodeVoltage( capacitor.capacitor.nodeId0 ),
          solution.getCurrent( capacitor )
        );
        return new DynamicCapacitor( capacitor.capacitor, dynamicElementState );
      } );
      const updatedInductors = this.inductors.map( inductor => {
        const dynamicElementState = new DynamicElementState(
          solution.getNodeVoltage( inductor.inductor.nodeId1 ) - solution.getNodeVoltage( inductor.inductor.nodeId0 ),
          solution.getCurrent( inductor )
        );
        return new DynamicInductor( inductor.inductor, dynamicElementState );
      } );

      return new DynamicCircuit( this.resistors, this.resistiveBatteries, updatedCapacitors, updatedInductors );
    }
  }

  /**
   * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
   * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct
   * dynamics (using instantaneous solutions) but also to show intermediate states (using the average results), see #2270.
   */
  class CircuitResult {

    /**
     * @param {ResultSet<DynamicCircuit.DynamicState>} resultSet
     */
    constructor( resultSet ) {
      this.resultSet = resultSet;
    }

    /**
     * The time averaged current is used to show transient values in current, such as a current spike when a battery+
     * capacitor (no resistance) circuit is wired up, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
     * @param {ModifiedNodalAnalysisCircuitElement} element
     * @returns {number}
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
     */
    getInstantaneousCurrent( element ) {
      return this.getFinalState().dynamicCircuitSolution.getCurrent( element );
    }

    /**
     * @param {ModifiedNodalAnalysisCircuitElement} element
     * @returns {number}
     */
    getInstantaneousVoltage( element ) {
      return this.getFinalState().dynamicCircuitSolution.getVoltage( element );
    }

    /**
     * @returns {DynamicCircuit.DynamicState}
     */
    getFinalState() {
      return this.resultSet.getFinalState();
    }

    /**
     * @param {number} node
     * @returns {number}
     */
    getInstantaneousNodeVoltage( node ) {
      return this.getFinalState().dynamicCircuitSolution.getNodeVoltage( node );
    }
  }

  class DynamicCapacitor {

    /**
     * @param {Capacitor} capacitor
     * @param {DynamicElementState} state
     */
    constructor( capacitor, state ) {

      // @public {Capacitor}
      this.capacitor = capacitor;

      // @public {DynamicElementState}
      this.state = state;
    }
  }

  class DynamicInductor {

    /**
     * @param {Inductor} inductor
     * @param {DynamicElementState} state
     */
    constructor( inductor, state ) {

      // @public {Inductor}
      this.inductor = inductor;

      // @public {DynamicElementState}
      this.state = state;
    }
  }

  class Capacitor extends ModifiedNodalAnalysisCircuitElement {
    constructor( node0, node1, capacitance ) {
      super( node0, node1, null, 0 );
      this.capacitance = capacitance;
    }
  }

  class Inductor extends ModifiedNodalAnalysisCircuitElement {
    constructor( node0, node1, inductance ) {
      super( node0, node1, null, 0 );
      this.inductance = inductance;
    }
  }

  class ResistiveBattery extends ModifiedNodalAnalysisCircuitElement {
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
    constructor( voltage, current ) {
      this.current = current;
      this.voltage = voltage;
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

    update( dt ) {
      this.solution = this.dynamicCircuit.solvePropagate( dt );
      const newCircuit = this.dynamicCircuit.updateCircuit( this.solution );
      return new DynamicState( newCircuit, this.solution );
    }

    /**
     * Returns an array of characteristic measurements from the solution, in order to determine
     * deviations.
     * @returns {number[]}
     * @public
     */
    getCharacteristicArray() {

      // TODO: read from companion object, or perhaps the solution.  Though the solution has been applied to the circuit.
      const currents = [];
      for ( let i = 0; i < this.dynamicCircuit.capacitors.length; i++ ) {
        currents.push( this.dynamicCircuit.capacitors[ i ].state.current );
      }
      for ( let i = 0; i < this.dynamicCircuit.inductors.length; i++ ) {
        currents.push( this.dynamicCircuit.inductors[ i ].state.current );
      }
      return currents;
    }
  }

  class DynamicCircuitSolution {

    /**
     * @param {DynamicCircuit} circuit
     * @param {ModifiedNodalAnalysisSolution} mnaSolution
     * @param {Object[]} currentCompanions
     * @constructor
     */
    constructor( circuit, mnaSolution, currentCompanions ) {
      this.circuit = circuit;
      this.mnaSolution = mnaSolution;
      this.currentCompanions = currentCompanions;
    }

    /**
     * @param {number} nodeIndex - index
     * @returns {number}
     */
    getNodeVoltage( nodeIndex ) {
      return this.mnaSolution.getNodeVoltage( nodeIndex );
    }

    /**
     * @param {ModifiedNodalAnalysisCircuitElement|CapacitorAdapter|InductorAdapter} element
     * @returns {number}
     */
    getCurrent( element ) {

      // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
      // 0-resistance battery), the current is given by the matrix solution.
      if ( element.hasOwnProperty( 'currentSolution' ) && element.currentSolution !== null ) {
        return element.currentSolution;
      }

      // TODO: the comparisons are asymmetrical, how can they both work?
      const companion = _.find( this.currentCompanions, c => c.element === element ||
                                                             c.element.capacitor === element ||
                                                             c.element.inductor === element );

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
     */
    getVoltage( element ) {
      return this.getNodeVoltage( element.nodeId1 ) - this.getNodeVoltage( element.nodeId0 );
    }
  }

  DynamicCircuit.Capacitor = Capacitor;
  DynamicCircuit.Inductor = Inductor;
  DynamicCircuit.DynamicElementState = DynamicElementState;
  DynamicCircuit.DynamicCapacitor = DynamicCapacitor;
  DynamicCircuit.DynamicInductor = DynamicInductor;
  DynamicCircuit.ResistiveBattery = ResistiveBattery;

  return circuitConstructionKitCommon.register( 'DynamicCircuit', DynamicCircuit );
} );