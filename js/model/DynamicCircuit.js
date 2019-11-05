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
     * @param {ResistiveBattery[]} resistiveBatteries
     * @param {Capacitor[]} capacitors
     * @param {Inductor[]} inductors
     */
    constructor( batteries, resistors, resistiveBatteries, capacitors, inductors ) {
      this.batteries = batteries;
      this.capacitors = capacitors;
      this.inductors = inductors;
      this.resistiveBatteries = resistiveBatteries;
      this.resistors = resistors;
    }

    /**
     * Solving the companion model is the same as propagating forward in time by dt.
     *
     * @param {number} dt
     * @returns {DynamicCircuitSolution}
     * @public
     */
    solvePropagate( dt ) {
      const result = this.toMNACircuit( dt );
      const mnaSolution = result.mnaCircuit.solve();
      return new DynamicCircuitSolution( this, mnaSolution, result.currentCompanions );
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
      return new DynamicCircuit( this.batteries, this.resistors, this.resistiveBatteries, updatedCapacitors, updatedInductors );
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

      const currentCompanions = [];
      const usedNodes = {}; // Keys only for integer used node set
      const elements = [];//new ArrayList<LinearCircuitSolver.Element>();
      elements.push( ...this.batteries );
      elements.push( ...this.resistors );
      elements.push( ...this.resistiveBatteries );
      elements.push( ...this.capacitors );
      elements.push( ...this.inductors );
      elements.forEach( e => {

        // TODO: Surely there must be a better way!
        if ( e.capacitor ) {
          usedNodes[ e.capacitor.nodeId0 ] = true;
          usedNodes[ e.capacitor.nodeId1 ] = true;
        }
        else if ( e.inductor ) {
          usedNodes[ e.inductor.nodeId0 ] = true;
          usedNodes[ e.inductor.nodeId1 ] = true;
        }
        else {
          assert && assert( typeof e.nodeId0 === 'number' && !isNaN( e.nodeId0 ) );
          assert && assert( typeof e.nodeId1 === 'number' && !isNaN( e.nodeId1 ) );
          usedNodes[ e.nodeId0 ] = true;
          usedNodes[ e.nodeId1 ] = true;
        }
      } );

      //each resistive battery is a resistor in series with a battery
      this.resistiveBatteries.forEach( resistiveBattery => {
        const keys = Object.keys( usedNodes ).map( x => parseInt( x, 10 ) );
        const newNode = Math.max( ...keys ) + 1;
        usedNodes[ newNode ] = true;

        const idealBattery = new ModifiedNodalAnalysisCircuitElement( resistiveBattery.nodeId0, newNode, null, resistiveBattery.voltage ); // final LinearCircuitSolver.Battery

        // same type as idealBattery, but treated like a resistor because it goes in the resistor array
        const idealResistor = new ModifiedNodalAnalysisCircuitElement( newNode, resistiveBattery.nodeId1, null, resistiveBattery.resistance ); // LinearCircuitSolver.Resistor
        companionBatteries.push( idealBattery );
        companionResistors.push( idealResistor );

        //we need to be able to get the current for this component
        currentCompanions.push( {
          element: resistiveBattery,
          getValueForSolution: solution => idealBattery.currentSolution
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
        assert && assert( c instanceof DynamicCapacitor, 'Should have been DynamicCapacitor' );
        const capacitor = c;
        const state = c.state;
        //in series
        const keys = Object.keys( usedNodes ).map( x => parseInt( x, 10 ) );
        const newNode = Math.max( ...keys ) + 1;
        usedNodes[ newNode ] = true;

        const companionResistance = dt / 2.0 / capacitor.capacitor.capacitance;
        const companionVoltage = state.voltage - companionResistance * state.current; //TODO: explain the difference between this sign and the one in TestTheveninCapacitorRC
        //      println("companion resistance = "+companionResistance+", companion voltage = "+companionVoltage)

        const battery = new ModifiedNodalAnalysisCircuitElement( capacitor.capacitor.nodeId0, newNode, null, companionVoltage );
        const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, capacitor.capacitor.nodeId1, null, companionResistance );
        // debugger;
        companionBatteries.push( battery );
        companionResistors.push( resistor );

        //we need to be able to get the current for this component
        //in series, so current is same through both companion components );
        // TODO: Previously used resistor to get current.  Check sign is correct.
        currentCompanions.push( {
          element: capacitor,
          getValueForSolution: solution => battery.currentSolution
        } );
      } );

      // See also http://circsimproj.blogspot.com/2009/07/companion-models.html
      // See najm page 279
      // See Pillage page 86
      this.inductors.forEach( i => {
        const inductor = i.getInductor();
        const state = i.state;
        //in series
        const keys = Object.keys( usedNodes ).map( x => parseInt( x, 10 ) );  // TODO: factor out these 3 lines
        const newNode = Math.max( ...keys ) + 1;
        usedNodes[ newNode ] = true;

        const companionResistance = 2 * inductor.inductance / dt;
        const companionVoltage = state.voltage + companionResistance * state.current;

        const battery = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId0, null, companionVoltage );
        const resistor = new ModifiedNodalAnalysisCircuitElement( newNode, inductor.nodeId1, null, companionResistance );
        companionBatteries.push( battery );
        companionResistors.push( resistor );

        // we need to be able to get the current for this component
        // in series, so current is same through both companion components
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
      const newCurrentList = [];
      newCurrentList.push( ...companionCurrents );

      const mnaCircuit = new ModifiedNodalAnalysisCircuit( newBatteryList, newResistorList, newCurrentList );
      return new Result( mnaCircuit, currentCompanions );
    }
  }

  /**
   * This class represents the solution obtained by a timestep-subdivision-oriented MNA solve with companion models.
   * The distinction between instantaneous and average currents/voltages is made because we need to maintain the correct dynamics
   * (using instantaneous solutions) but also to show intermediate states (using the average results), see #2270.
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
      this.resultSet.states.forEach( state => {
        weightedSum += state.state.dynamicCircuitSolution.getCurrent( element ) * state.subdivisionDT;//todo: make sure this is right
        assert && assert( !isNaN( weightedSum ) );
      } );

      const number = weightedSum / this.resultSet.getTotalTime();
      assert && assert( !isNaN( number ) );
      return number;
    }

    /**
     * @param {LinearCircuitSolver.Element} element
     * @returns {number}
     */
    getInstantaneousCurrent( element ) {
      return this.getFinalState().dynamicCircuitSolution.getCurrent( element );
    }

    /**
     * @param {LinearCircuitSolver.Element} element
     * @returns {number}
     */
    getTimeAverageVoltage( element ) {
      let weightedSum = 0.0;
      this.resultSet.forEach( state => {
        weightedSum += state.state.dynamicCircuitSolution.getVoltage( element ) * state.dt;//todo: make sure this is right
      } );
      return weightedSum / this.resultSet.getTotalTime();
    }

    /**
     * @param {LinearCircuitSolver.Element} element
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

    /**
     * @param {number} node
     * @returns {number}
     */
    getAverageNodeVoltage( node ) {
      let weightedSum = 0.0;
      this.resultSet.forEach( state => {
        weightedSum += state.state.dynamicCircuitSolution.getNodeVoltage( node ) * state.dt;//todo: make sure this is right too
      } );
      return weightedSum / this.resultSet.getTotalTime();
    }
  }

  class DynamicCapacitor {
    constructor( capacitor, state ) {
      assert && assert( !isNaN( state.current ), 'current should be numeric' );
      assert && assert( capacitor instanceof DynamicCircuit.Capacitor );
      this.capacitor = capacitor;
      this.state = state;
      this.current = state.current; // TODO: is this used?  Why is it different than the method?
    }

    getCurrent() {
      return this.state.current;
    }
  }

  class DynamicInductor {
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

  class Result {
    constructor( mnaCircuit, currentCompanions ) {
      this.mnaCircuit = mnaCircuit;
      this.currentCompanions = currentCompanions;
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

      //todo: read from companion object, or perhaps the solution.  Though the solution has been applied to the circuit.
      const currents = [];
      for ( let i = 0; i < this.dynamicCircuit.capacitors.length; i++ ) {
        currents.push( this.dynamicCircuit.capacitors[ i ].getCurrent() );
      }
      for ( let i = 0; i < this.dynamicCircuit.inductors.length; i++ ) {
        currents.push( this.dynamicCircuit.inductors[ i ].getCurrent() );
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
      // TODO: can the nan check be done at assignment time?
      if ( element.hasOwnProperty( 'currentSolution' ) && element.currentSolution !== null ) {
        assert && assert( !isNaN( element.currentSolution ) );
        return element.currentSolution;
      }

      // TODO: the comparisons are asymmetrical, how can they both work?
      const companion = _.find( this.currentCompanions, c => c.element === element ||
                                                             c.element.capacitor === element ||
                                                             c.element === element.inductor );

      if ( companion ) {
        // TODO: maybe a passthrough assertNumber function?
        const x = companion.getValueForSolution( this.mnaSolution );
        assert && assert( !isNaN( x ) );
        return x;
      }
      else {
        const y = this.mnaSolution.getCurrentForResistor( element );
        assert && assert( !isNaN( y ) );
        return y;
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