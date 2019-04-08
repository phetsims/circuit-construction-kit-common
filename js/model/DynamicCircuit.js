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
     * @param {ModifiedNodalAnalysisCircuitElement[]} batteries
     * @param {ModifiedNodalAnalysisCircuitElement[]} resistors
     * @param {Object[]} currents - TODO: unused, will this be used after capacitors and inductors have companions?
     * @param {ResistiveBattery[]} resistiveBatteries
     * @param {Capacitor[]} capacitors
     * @param {Inductor[]} inductors
     */
    constructor( batteries, resistors, currents, resistiveBatteries, capacitors, inductors ) {
      this.batteries = batteries;
      this.capacitors = capacitors;
      this.currents = currents;
      this.inductors = inductors;
      this.resistiveBatteries = resistiveBatteries;
      this.resistors = resistors;
    }

    /**
     * Solving the companion model is the same as propagating forward in time by dt.
     *
     * @param {number} dt
     * @returns {DynamicCircuitSolution}
     */
    solvePropagate( dt ) {
      const result = this.toMNACircuit( dt );
      const mnaSolution = result.mnaCircuit.solve();
      return new DynamicCircuitSolution( this, mnaSolution, result.currentCompanions );
    }

    //TODO: generalize distance criterion, will be simpler if solutions are incorporated
    /**
     * @param {TimestepSubdivisions} timestepSubdivisions
     * @param {number} dt
     * @returns {CircuitResult}
     */
    solveWithSubdivisions( timestepSubdivisions, dt ) {
      const steppable = {
        update: ( a, dt ) => a.update( dt ),
        distance: ( a, b ) => {
          const aCurrents = [];
          for ( let i = 0; i < a.circuit.capacitors.length; i++ ) {
            aCurrents.push( a.circuit.capacitors[ i ].getCurrent() );
          }
          for ( let i = 0; i < a.circuit.inductors.length; i++ ) {
            aCurrents.push( a.circuit.inductors[ i ].getCurrent() );
          }

          const bCurrents = [];
          for ( let i = 0; i < b.circuit.capacitors.length; i++ ) {
            bCurrents.push( b.circuit.capacitors[ i ].getCurrent() );
          }
          for ( let i = 0; i < b.circuit.inductors.length; i++ ) {
            bCurrents.push( b.circuit.inductors[ i ].getCurrent() );//todo: read from companion object
          }
          return euclideanDistance( aCurrents, bCurrents );
        }
      };
      //turing the error threshold too low here can fail the inductor tests in MNATestCase
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
      return this.solveWithSubdivisions2( dt ).getFinalState().getCircuit();
    }

    /**
     * @param {number} dt
     * @returns DynamicCircuitSolution
     */
    solveItWithSubdivisions( dt ) {
      return this.solveWithSubdivisions2( dt ).getFinalState().getSolution();
    }

    /**
     * @param {TimestepSubdivisions<DynamicState>} timestepSubdivisions
     * @param {number} dt
     * @returns DynamicCircuitSolution
     */
    solveItWithSubdivisions2( timestepSubdivisions, dt ) {
      return this.solveWithSubdivisions( timestepSubdivisions, dt ).getFinalState().getSolution();
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
     * @returns DynamicCircuit
     */
    updateCircuit( solution ) {
      const updatedCapacitors = this.capacitors.map( c => new DynamicCapacitor( c.capacitor, new DynamicElementState(
        solution.getNodeVoltage( c.capacitor.nodeId1 ) - solution.getNodeVoltage( c.capacitor.nodeId0 ),
        solution.getCurrent( c.capacitor ) ) )
      );
      const updatedInductors = this.inductors.map( i => new DynamicInductor( i.inductor, new DynamicElementState(
        solution.getNodeVoltage( i.inductor.nodeId1 ) - solution.getNodeVoltage( i.inductor.nodeId0 ),
        solution.getCurrent( i.inductor ) ) )
      );
      return new DynamicCircuit( this.batteries, this.resistors, this.currents, this.resistiveBatteries, updatedCapacitors, updatedInductors );
    }

    //TODO: why not give every component a companion in the MNACircuit?
    /**
     * @param {number} dt
     * @returns {Result}
     */
    toMNACircuit( dt ) {

      const companionBatteries = [];//new ArrayList<LinearCircuitSolver.Battery>();
      const companionResistors = [];//new ArrayList<LinearCircuitSolver.Resistor>();
      const companionCurrents = [];//new ArrayList<LinearCircuitSolver.CurrentSource>();

      // HashMap<LinearCircuitSolver.Element, SolutionToDouble>
      const currentCompanions = []; // TODO: HashMap won't work in JS
      const usedNodes = {}; // Keys only for integer used node set
      const elements = [];//new ArrayList<LinearCircuitSolver.Element>();
      elements.push( ...this.batteries );
      elements.push( ...this.resistors );
      elements.push( ...this.resistiveBatteries );
      elements.push( ...this.currents );
      this.capacitors.forEach( c => elements.push( c.capacitor ) );
      this.inductors.forEach( i => elements.push( i.inductor ) );
      elements.forEach( e => {
        usedNodes[ e.nodeId0 ] = true;
        usedNodes[ e.nodeId1 ] = true;
      } );

      //each resistive battery is a resistor in series with a battery
      this.resistiveBatteries.forEach( resistiveBattery => {
        const keys = Object.keys( usedNodes ).map( x => parseInt( x, 10 ) );
        const newNode = Math.max( ...keys ) + 1;
        usedNodes[ newNode ] = true;

        // TODO: JS how to indicate this is battery?  It is lost in
        const idealBattery = new ModifiedNodalAnalysisCircuitElement( resistiveBattery.nodeId0, newNode, null, resistiveBattery.voltage ); // final LinearCircuitSolver.Battery

        // TODO: JS how to indicate this is resistor?
        const idealResistor = new ModifiedNodalAnalysisCircuitElement( newNode, resistiveBattery.nodeId1, null, resistiveBattery.resistance ); // LinearCircuitSolver.Resistor
        companionBatteries.push( idealBattery );
        companionResistors.push( idealResistor );

        //we need to be able to get the current for this component
        currentCompanions.push( {
          element: resistiveBattery,
          getValueForSolution: solution => solution.getCurrent( idealBattery )
        } );
      } );

      //add companion models for capacitor

      //TRAPEZOIDAL
      //        double vc = state.v + dt / 2 / c * state.i;
      //        double rc = dt / 2 / c;

      //BACKWARD EULER
      //        double vc = state.v;
      //        double rc = dt / c;
      this.capacitors.forEach( c => { // c is DynamicCapacitor
        const capacitor = c.capacitor;
        const state = c.state;
        //in series
        const keys = Object.keys( usedNodes ).map( x => parseInt( x, 10 ) );
        const newNode = Math.max( ...keys ) + 1;
        usedNodes[ newNode ] = true;

        const companionResistance = dt / 2.0 / capacitor.capacitance;
        const companionVoltage = state.voltage - companionResistance * state.current; //TODO: explain the difference between this sign and the one in TestTheveninCapacitorRC
        //      println("companion resistance = "+companionResistance+", companion voltage = "+companionVoltage)

        const battery = new ModifiedNodalAnalysisCircuitElement( capacitor.nodeId0, newNode, null, companionVoltage );
        const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, capacitor.nodeId1, null, companionResistance );
        companionBatteries.push( battery );
        companionResistors.push( resistor );

        //we need to be able to get the current for this component
        //in series, so current is same through both companion components );
        // TODO: used to use battery to get current.  Check sign is correct.
        currentCompanions.push( {
          element: capacitor,
          getValueForSolution: solution => solution.getCurrentForResistor( resistor )
        } );
      } );

      //see also http://circsimproj.blogspot.com/2009/07/companion-models.html
      //see najm page 279
      //pillage p 86
      this.inductors.forEach( i => {
        const inductor = i.getInductor();
        const state = i.state;
        //in series
        const keys = Object.keys( usedNodes ).map( x => parseInt( x, 10 ) );  // TODO: factor out these 3 lines
        const newNode = Math.max( ...keys ) + 1;
        usedNodes[ newNode ] = true;

        const companionResistance = 2 * inductor.inductance / dt;
        const companionVoltage = state.voltage + companionResistance * state.current;

        // TODO: How does the system know this is a battery and not a resistor?
        const battery = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId0, null, companionVoltage );

        // TODO: How does the system know this is a resistor and not a battery?
        const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId1, null, companionResistance );
        companionBatteries.push( battery );
        companionResistors.push( resistor );

        //we need to be able to get the current for this component
        //in series, so current is same through both companion components
        currentCompanions.push( {
          element: inductor,
          getValueForSolution: solution => -solution.getCurrentForResistor( resistor ) // TODO: check sign, this was converted from battery to resistor
        } );
      } );

      //        println("currentCompanions = " + currentCompanions)
      //    for (i <- inductors) {
      //      mnaBatteries += new Battery
      //      mnaCurrents += new CurrentSource
      //    }
      const newBatteryList = [ ...this.batteries ];
      newBatteryList.push( ...companionBatteries );
      const newResistorList = [ ...this.resistors ];
      newResistorList.push( ...companionResistors );
      const newCurrentList = [ ...this.currents ];
      newCurrentList.push( ...companionCurrents );

      const mnaCircuit = new ModifiedNodalAnalysisCircuit( newBatteryList, newResistorList, newCurrentList );
      return new Result( mnaCircuit, currentCompanions );
    }
  }

  /**
   * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
   * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct dynamics
   * (using instantantaneous solutions) but also to show intermediate states (using the average results), see #2270.
   */
  class CircuitResult {

    /**
     * @param {ResultSet<DynamicCircuit.DynamicState>} resultSet
     */
    constructor( resultSet ) {
      this.resultSet = resultSet; // private ResultSet<DynamicCircuit.DynamicState>
    }

    /**
     * @param {LinearCircuitSolver.Element} element
     * @returns {number}
     */
    getTimeAverageCurrent( element ) {
      let weightedSum = 0.0;
      this.resultSet.forEach( state => {
        weightedSum += state.state.getSolution().getCurrent( element ) * state.dt;//todo: make sure this is right
      } );
      return weightedSum / this.resultSet.getTotalTime();
    }

    /**
     * @param {LinearCircuitSolver.Element} element
     * @returns {number}
     */
    getInstantaneousCurrent( element ) {
      return this.getFinalState().getSolution().getCurrent( element );
    }

    /**
     * @param {LinearCircuitSolver.Element} element
     * @returns {number}
     */
    getTimeAverageVoltage( element ) {
      let weightedSum = 0.0;
      this.resultSet.forEach( state => {
        weightedSum += state.state.getSolution().getVoltage( element ) * state.dt;//todo: make sure this is right
      } );
      return weightedSum / this.resultSet.getTotalTime();
    }

    /**
     * @param {LinearCircuitSolver.Element} element
     * @returns {number}
     */
    getInstantaneousVoltage( element ) {
      return this.getFinalState().getSolution().getVoltage( element );
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
      return this.getFinalState().getSolution().getNodeVoltage( node );
    }

    /**
     * @param {number} node
     * @returns {number}
     */
    getAverageNodeVoltage( node ) {
      let weightedSum = 0.0;
      this.resultSet.forEach( state => {
        weightedSum += state.state.getSolution().getNodeVoltage( node ) * state.dt;//todo: make sure this is right too
      } );
      return weightedSum / this.resultSet.getTotalTime();
    }
  }

  class DynamicCapacitor {
    // public DynamicCapacitor( Capacitor capacitor, DynamicElementState state ) {
    constructor( capacitor, state ) {
      assert && assert( !isNaN( state.current ), 'current should be numeric' );
      this.capacitor = capacitor;
      this.state = state;
      this.current = state.current;
    }

    getCurrent() {
      return this.state.current;
    }
  }

  class DynamicInductor {
    // public DynamicInductor( Inductor inductor, DynamicElementState state ) {
    constructor( inductor, state ) {
      this.inductor = inductor;
      this.state = state;
    }

    getCurrent() {
      return this.state.current;
    }

    getInductor() {
      return this.inductor;
    }

    getState() {
      return this.state;
    }
  }

  class Capacitor extends ModifiedNodalAnalysisCircuitElement {
    constructor( node0, node1, capacitance ) {// public Capacitor( int node0, int node1, double capacitance ) {
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
      this.voltage = voltage;
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

  class Result {
    constructor( mnaCircuit, currentCompanions ) {
      this.mnaCircuit = mnaCircuit;
      this.currentCompanions = currentCompanions;
    }
  }

  class DynamicState {

    constructor( circuit, solution ) {
      assert && assert( circuit, 'circuit should be defined' );
      this.circuit = circuit;
      this.solution = solution;
    }

    update( dt ) {
      this.solution = this.circuit.solvePropagate( dt );
      const newCircuit = this.circuit.updateCircuit( this.solution );
      return new DynamicState( newCircuit, this.solution );
    }

    getCircuit() {
      return this.circuit;
    }

    getSolution() {
      return this.solution;
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
     * @param {ModifiedNodalAnalysisCircuitElement} element
     * @returns {number}
     */
    getCurrent( element ) {
      const companion = _.find( this.currentCompanions, c => c.element === element );

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