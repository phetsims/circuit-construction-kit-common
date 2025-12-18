// Copyright 2019-2025, University of Colorado Boulder

/**
 * Takes a Circuit, creates a corresponding LTACircuit, solves the LTACircuit and applies the results back
 * to the original Circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import CCKCConstants from '../../CCKCConstants.js';
import CCKCQueryParameters from '../../CCKCQueryParameters.js';
import CCKCUtils from '../../CCKCUtils.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import Capacitor from '../Capacitor.js';
import type Circuit from '../Circuit.js';
import type CircuitElement from '../CircuitElement.js';
import type CircuitGroup from '../CircuitGroup.js';
import Fuse from '../Fuse.js';
import Inductor from '../Inductor.js';
import LightBulb from '../LightBulb.js';
import Resistor from '../Resistor.js';
import SeriesAmmeter from '../SeriesAmmeter.js';
import Switch from '../Switch.js';
import type Vertex from '../Vertex.js';
import VoltageSource from '../VoltageSource.js';
import Wire from '../Wire.js';
import EEcircuitSolverManager from './EEcircuitSolverManager.js';
import LTACapacitor from './LTACapacitor.js';
import LTACircuit from './LTACircuit.js';
import LTAInductor from './LTAInductor.js';
import LTAResistiveBattery from './LTAResistiveBattery.js';
import type LTAState from './LTAState.js';
import MNABattery from './mna/MNABattery.js';
import MNAResistor from './mna/MNAResistor.js';
import type MNASolution from './mna/MNASolution.js';
import TimestepSubdivisions from './TimestepSubdivisions.js';

// constants
const TIMESTEP_SUBDIVISIONS = new TimestepSubdivisions<LTAState>();

let id = 0;

export default class LinearTransientAnalysis {

  /**
   * Solves the system with Modified Nodal Analysis, and apply the results back to the Circuit.
   */
  public static solveModifiedNodalAnalysis( circuit: Circuit, dt: number ): void {

    // Branch based on solver selection
    if ( CCKCQueryParameters.solver === 'eecircuit' ) {
      this.solveWithEEcircuit( circuit );
    }
    else {
      this.solveWithPhetMNA( circuit, dt );
    }
  }

  /**
   * Solve using EEcircuit SPICE solver (async with callbacks).
   * Currently supports DC circuits only (batteries + resistors).
   *
   * IMPORTANT: SPICE cannot handle disconnected subcircuits in a single solve.
   * We use circuit.getGroups() to find connected components and solve each one separately.
   * When each solve completes, a callback applies results directly to circuit elements.
   */
  private static solveWithEEcircuit( circuit: Circuit ): void {

    // Use circuit.getGroups() to find connected components.
    // Each group is solved separately by SPICE to avoid singularity errors.
    const groups = circuit.getGroups();

    // Filter to groups that have voltage sources (others have no current flow)
    const groupsWithVoltageSources = groups.filter( group =>
      group.circuitElements.some( element => element instanceof VoltageSource )
    );

    // Track all non-participants (elements not being solved)
    const allNonParticipants: CircuitElement[] = [];

    // Elements in groups without voltage sources are non-participants
    for ( const group of groups ) {
      const hasVoltageSource = group.circuitElements.some( e => e instanceof VoltageSource );
      if ( !hasVoltageSource ) {
        allNonParticipants.push( ...group.circuitElements );
      }
    }

    // Zero out non-participants immediately
    for ( const element of allNonParticipants ) {
      element.currentProperty.value = 0;
    }

    // If no groups have voltage sources, zero out everything
    if ( groupsWithVoltageSources.length === 0 ) {
      for ( const circuitElement of circuit.circuitElements ) {
        circuitElement.currentProperty.value = 0;
      }
      return;
    }

    // Request solve for each valid group (results applied via callback)
    for ( const group of groupsWithVoltageSources ) {
      this.solveGroup( circuit, group );
    }
  }

  /**
   * Build MNA elements and request a solve for a single connected component (group).
   * When the solve completes, the callback applies results directly to circuit elements.
   */
  private static solveGroup( circuit: Circuit, group: CircuitGroup ): void {
    const batteries: MNABattery[] = [];
    const resistors: MNAResistor[] = [];
    const batteryMap = new Map<string, VoltageSource>();
    const batteryMNAMap = new Map<string, MNABattery>();
    const resistorMap = new Map<string, CircuitElement>();
    const nonParticipants: CircuitElement[] = [];

    for ( const circuitElement of group.circuitElements ) {

      // Skip non-traversable elements (like open switches)
      if ( !circuitElement.isTraversibleProperty.value ) {
        nonParticipants.push( circuitElement );
        continue;
      }

      const nodeId0 = circuitElement.startVertexProperty.value.index + '';
      const nodeId1 = circuitElement.endVertexProperty.value.index + '';

      if ( circuitElement instanceof VoltageSource ) {
        const battery = new MNABattery( nodeId0, nodeId1, circuitElement.voltageProperty.value );
        batteries.push( battery );
        const key = `${nodeId0}_${nodeId1}`;
        batteryMap.set( key, circuitElement );
        batteryMNAMap.set( key, battery );
      }
      else if ( circuitElement instanceof Resistor ||
                circuitElement instanceof Wire ||
                circuitElement instanceof LightBulb ||
                circuitElement instanceof SeriesAmmeter ||
                circuitElement instanceof Switch ||
                circuitElement instanceof Fuse ) {

        const resistance = circuitElement.resistanceProperty.value || CCKCConstants.MINIMUM_RESISTANCE;
        const resistor = new MNAResistor( nodeId0, nodeId1, resistance );
        resistors.push( resistor );
        resistorMap.set( `${nodeId0}_${nodeId1}`, circuitElement );
      }
      else if ( circuitElement instanceof Capacitor || circuitElement instanceof Inductor ) {
        // Skip capacitors/inductors for DC-only MVP
        nonParticipants.push( circuitElement );
      }
    }

    // Skip if no batteries after filtering
    if ( batteries.length === 0 ) {
      return;
    }

    // Request solve with callback that applies results when complete
    EEcircuitSolverManager.instance.requestSolve(
      batteries,
      resistors,
      ( solution: MNASolution ) => {
        this.applyEEcircuitSolution( circuit, solution, batteryMap, batteryMNAMap, resistorMap, nonParticipants );
      }
    );
  }

  /**
   * Apply EEcircuit solution back to the circuit elements.
   */
  private static applyEEcircuitSolution(
    circuit: Circuit,
    solution: MNASolution,
    batteryMap: Map<string, VoltageSource>,
    batteryMNAMap: Map<string, MNABattery>,
    resistorMap: Map<string, CircuitElement>,
    nonParticipants: CircuitElement[]
  ): void {

    // Apply currents to batteries
    for ( const [ key, voltageSource ] of batteryMap ) {
      const mnaBattery = batteryMNAMap.get( key );
      if ( mnaBattery ) {
        // Get the solved current directly from the solution
        const current = solution.getSolvedCurrent( mnaBattery );
        voltageSource.currentProperty.value = current;
      }
      else {
        voltageSource.currentProperty.value = 0;
      }
    }

    // Apply currents to resistors
    for ( const [ key, circuitElement ] of resistorMap ) {
      const [ nodeId0, nodeId1 ] = key.split( '_' );
      const v0 = solution.getNodeVoltage( nodeId0 );
      const v1 = solution.getNodeVoltage( nodeId1 );

      affirm( v0 !== undefined, `v0 is undefined for nodeId0=${nodeId0}` );
      affirm( v1 !== undefined, `v1 is undefined for nodeId1=${nodeId1}` );

      // Get resistance from the circuit element (all resistor-like elements have resistanceProperty)
      let resistance = CCKCConstants.MINIMUM_RESISTANCE;
      if ( circuitElement instanceof Resistor ||
           circuitElement instanceof Wire ||
           circuitElement instanceof LightBulb ||
           circuitElement instanceof Switch ||
           circuitElement instanceof Fuse ) {
        resistance = circuitElement.resistanceProperty.value || CCKCConstants.MINIMUM_RESISTANCE;
      }
      else if ( circuitElement instanceof SeriesAmmeter ) {
        resistance = CCKCConstants.MINIMUM_RESISTANCE; // Ammeter has ~0 resistance
      }

      // Current from Ohm's law: I = V/R
      // Note: sign convention - current flows from high to low potential
      const current = -( v1 - v0 ) / resistance;
      circuitElement.currentProperty.value = current;
    }

    // Zero out non-participants
    for ( const circuitElement of nonParticipants ) {
      circuitElement.currentProperty.value = 0;
    }

    // Apply node voltages to vertices
    const solvedVertices: Vertex[] = [];
    const unsolvedVertices: Vertex[] = [];

    circuit.vertexGroup.forEach( vertex => {
      const nodeId = vertex.index + '';
      const voltage = solution.getNodeVoltage( nodeId );

      if ( typeof voltage === 'number' && !isNaN( voltage ) ) {
        // EEcircuit uses standard SPICE convention, PhET negates
        vertex.voltageProperty.value = voltage;
        solvedVertices.push( vertex );
      }
      else {
        unsolvedVertices.push( vertex );
      }
    } );

    // Propagate voltages to unsolved vertices via DFS
    this.propagateVoltages( circuit, solvedVertices, unsolvedVertices );
  }

  /**
   * Propagate voltages from solved to unsolved vertices.
   */
  private static propagateVoltages( circuit: Circuit, solvedVertices: Vertex[], unsolvedVertices: Vertex[] ): void {
    const visited: Vertex[] = [];

    const visitVoltage = ( startVertex: Vertex, circuitElement: CircuitElement, endVertex: Vertex ) => {
      if ( solvedVertices.includes( endVertex ) ) {
        return;
      }

      const sign = startVertex === circuitElement.startVertexProperty.value ? 1 : -1;

      if ( !circuitElement.isTraversibleProperty.value ) {
        // no-op
      }
      else if ( circuitElement instanceof Resistor ||
                circuitElement instanceof Wire ||
                circuitElement instanceof LightBulb ||
                circuitElement instanceof Switch ||
                circuitElement instanceof Fuse ||
                circuitElement instanceof SeriesAmmeter ) {
        // Zero current means zero voltage drop
        endVertex.voltageProperty.value = startVertex.voltageProperty.value;
        solvedVertices.push( endVertex );
      }
      else if ( circuitElement instanceof VoltageSource ) {
        endVertex.voltageProperty.value = startVertex.voltageProperty.value + sign * circuitElement.voltageProperty.value;
        solvedVertices.push( endVertex );
      }
      else if ( circuitElement instanceof Capacitor || circuitElement instanceof Inductor ) {
        endVertex.voltageProperty.value = startVertex.voltageProperty.value - sign * circuitElement.mnaVoltageDrop;
        solvedVertices.push( endVertex );
      }
    };

    const dfs = ( vertex: Vertex ) => {
      visited.push( vertex );
      for ( const circuitElement of circuit.circuitElements ) {
        if ( circuitElement.containsVertex( vertex ) ) {
          const opposite = circuitElement.getOppositeVertex( vertex );
          if ( !visited.includes( opposite ) && circuitElement.isTraversibleProperty.value ) {
            visitVoltage( vertex, circuitElement, opposite );
            dfs( opposite );
          }
        }
      }
    };

    const allVertices = [ ...solvedVertices, ...unsolvedVertices ];
    for ( const vertex of allVertices ) {
      if ( !visited.includes( vertex ) ) {
        dfs( vertex );
      }
    }
  }

  /**
   * Solve using PhET's in-house MNA solver (original implementation).
   */
  private static solveWithPhetMNA( circuit: Circuit, dt: number ): void {

    const ltaBatteries = [];
    const ltaResistors = [];
    const ltaCapacitors = [];
    const ltaInductors = [];

    // Identify CircuitElements that are not in a loop with a voltage source. They will have their currents zeroed out.
    const nonParticipants = [];
    const participants = [];

    const resistorMap = new Map<MNAResistor, CircuitElement>(); // Should be something like Resistor | Fuse | Wire | LightBulb | SeriesAmmeter | Switch
    const voltageSourceMap = new Map<LTAResistiveBattery, VoltageSource>();
    const capacitorMap = new Map<LTACapacitor, Capacitor>();
    const inductorMap = new Map<LTAInductor, Inductor>();

    let hasRealBulbs = false;
    for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
      const circuitElement = circuit.circuitElements[ i ];

      const inLoop = circuit.isInLoop( circuitElement );

      if ( inLoop ) {
        participants.push( circuitElement );
        if ( !circuitElement.isTraversableProperty.value ) {

          // Cannot participate in the MNA
        }
        else if ( circuitElement instanceof VoltageSource ) {
          const ltaVoltageSource = new LTAResistiveBattery(
            id++,
            circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '',
            circuitElement.voltageProperty.value,
            circuitElement.internalResistanceProperty.value
          );
          voltageSourceMap.set( ltaVoltageSource, circuitElement );
          ltaBatteries.push( ltaVoltageSource );
        }
        else if ( circuitElement instanceof Resistor ||
                  circuitElement instanceof Wire ||
                  circuitElement instanceof LightBulb ||
                  circuitElement instanceof SeriesAmmeter ||
                  circuitElement instanceof Switch ||
                  circuitElement instanceof Fuse ) {

          // For real bulbs, we run an initial circuit solution to determine their operating characteristics.
          // These operating characteristics are then used in a second solution to prevent a hysteresis.

          // If a resistor goes to 0 resistance, then we cannot compute the current through as I=V/R.  Therefore,
          // simulate a small amount of resistance.
          const resistance = ( circuitElement instanceof LightBulb && circuitElement.isReal ) ? LightBulb.REAL_BULB_COLD_RESISTANCE :
                             ( circuitElement.resistanceProperty.value || CCKCConstants.MINIMUM_RESISTANCE );

          if ( circuitElement instanceof LightBulb && circuitElement.isReal ) {
            hasRealBulbs = true;
          }

          const resistorAdapter = new MNAResistor(
            circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '',
            resistance
          );
          resistorMap.set( resistorAdapter, circuitElement );
          ltaResistors.push( resistorAdapter );
        }
        else if ( circuitElement instanceof Capacitor ) {

          const ltaCapacitor = new LTACapacitor(
            id++,
            circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '',
            circuitElement.mnaVoltageDrop,
            circuitElement.mnaCurrent,
            circuitElement.capacitanceProperty.value
          );
          ltaCapacitors.push( ltaCapacitor );
          capacitorMap.set( ltaCapacitor, circuitElement );
        }
        else if ( circuitElement instanceof Inductor ) {

          const ltaInductor = new LTAInductor(
            id++,
            circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '',
            circuitElement.mnaVoltageDrop,
            circuitElement.mnaCurrent,
            circuitElement.inductanceProperty.value
          );
          inductorMap.set( ltaInductor, circuitElement );
          ltaInductors.push( ltaInductor );
        }
        else {
          affirm( false, `Type not found: ${circuitElement.constructor.name}` );
        }
      }
      else {
        nonParticipants.push( circuitElement );
      }
    }

    // Solve the system
    let ltaCircuit = new LTACircuit( ltaResistors, ltaBatteries, ltaCapacitors, ltaInductors );
    let circuitResult = ltaCircuit.solveWithSubdivisions( TIMESTEP_SUBDIVISIONS, dt );

    // the resistance of real bulbs is a function of their voltage
    if ( hasRealBulbs ) {

      // to estimate the resistance of a real bulb, we start by setting its resistance to REAL_BULB_COLD_RESISTANCE
      // then we solve the circuit to find the voltage across it, and update its resistance according to the log equation below
      // we repeat this process 10 times to get closer to the bulb's actual voltage and resistance
      // in testing, we found that 10 iterations brings the real bulb to within an acceptable range of the accurate resistance
      for ( let i = 0; i < 10; i++ ) {
        for ( let j = 0; j < ltaResistors.length; j++ ) {

          const resistorAdapter = ltaResistors[ j ];
          const circuitElement = resistorMap.get( resistorAdapter )!;
          if ( circuitElement instanceof LightBulb && circuitElement.isReal ) {
            const logWithBase = ( value: number, base: number ) => Math.log( value ) / Math.log( base );

            const dV = circuitResult.getFinalState().ltaSolution!.getVoltage( resistorAdapter.nodeId0, resistorAdapter.nodeId1 );
            const V = Math.abs( dV );

            const base = 2;

            // I = ln(V)
            // V=IR
            // V=ln(V)R
            // R = V/ln(V)

            // Adjust so it looks good in comparison to a standard bulb
            const coefficient = 3;

            // shift by base so at V=0 the log is 1
            resistorAdapter.resistance = LightBulb.REAL_BULB_COLD_RESISTANCE + coefficient * V / logWithBase( V + base, base );
            circuitElement.resistanceProperty.value = resistorAdapter.resistance;
          }
        }

        // If the circuit contains real bulbs, we need to solve the circuit again after calculating their resistance
        // to prevent a hysteresis. This ensures that the resistance of the bulbs is consistent with their voltage.
        ltaCircuit = new LTACircuit( ltaResistors, ltaBatteries, ltaCapacitors, ltaInductors );
        circuitResult = ltaCircuit.solveWithSubdivisions( TIMESTEP_SUBDIVISIONS, dt );
      }
    }

    // Apply the solutions from the analysis back to the actual Circuit
    ltaBatteries.forEach( batteryAdapter => {
      const circuitElement = voltageSourceMap.get( batteryAdapter )!;
      circuitElement.currentProperty.value = circuitResult.getTimeAverageCurrentForCoreModel( batteryAdapter );
    } );
    ltaResistors.forEach( resistorAdapter => {
      const circuitElement = resistorMap.get( resistorAdapter )!;
      circuitElement.currentProperty.value = circuitResult.getTimeAverageCurrent( resistorAdapter );
    } );
    ltaCapacitors.forEach( ltaCapacitor => {
      const capacitor = capacitorMap.get( ltaCapacitor )!;
      capacitor.currentProperty.value = circuitResult.getTimeAverageCurrentForCoreModel( ltaCapacitor );
      capacitor.mnaCurrent = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousCurrentForCoreModel( ltaCapacitor ) );
      capacitor.mnaVoltageDrop = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousVoltageForCoreModel( ltaCapacitor ) );

      affirm( Math.abs( capacitor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
      affirm( Math.abs( capacitor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
    } );
    ltaInductors.forEach( ltaInductor => {

      const inductor = inductorMap.get( ltaInductor )!;
      inductor.currentProperty.value = circuitResult.getTimeAverageCurrentForCoreModel( ltaInductor );
      inductor.mnaCurrent = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousCurrentForCoreModel( ltaInductor ) );
      inductor.mnaVoltageDrop = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousVoltageForCoreModel( ltaInductor ) );
      affirm( Math.abs( inductor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
      affirm( Math.abs( inductor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
    } );

    // zero out currents on open branches
    nonParticipants.forEach( circuitElement => {
      circuitElement.currentProperty.value = 0;

      // Clear disconnected isReal light bulbs
      if ( circuitElement instanceof LightBulb && circuitElement.isReal ) {
        circuitElement.resistanceProperty.value = LightBulb.REAL_BULB_COLD_RESISTANCE;
      }
    } );

    const solvedVertices: Vertex[] = [];
    const unsolvedVertices: Vertex[] = [];

    // Apply the node voltages to the vertices
    circuit.vertexGroup.forEach( vertex => {
      const voltage = circuitResult.getFinalState().ltaSolution!.getNodeVoltage( vertex.index + '' );

      if ( typeof voltage === 'number' ) {
        vertex.voltageProperty.value = -voltage;
        solvedVertices.push( vertex );
      }
      else {
        unsolvedVertices.push( vertex );
      }
    } );

    // compute voltages for open branches
    // for each connected component, start at a known voltage and depth first search the graph.
    const visitVoltage = ( startVertex: Vertex, circuitElement: CircuitElement, endVertex: Vertex ) => {

      // If we already know the voltage from the matrix solution, skip it.
      if ( !solvedVertices.includes( endVertex ) ) {

        const sign = startVertex === circuitElement.startVertexProperty.value ? 1 : -1;

        // compute end voltage from start voltage

        if ( !circuitElement.isTraversableProperty.value ) {

          // no-op
        }
        else if ( circuitElement instanceof Resistor ||
                  circuitElement instanceof Wire ||
                  circuitElement instanceof LightBulb ||
                  circuitElement instanceof Switch ||
                  circuitElement instanceof Fuse ||
                  circuitElement instanceof SeriesAmmeter
        ) {

          // In the general case, we would need V=IR to compute the voltage drop, but we know the current across the
          // non-participants is 0, so the voltage drop across them is also zero
          endVertex.voltageProperty.value = startVertex.voltageProperty.value;
          solvedVertices.push( endVertex );
        }
        else if ( circuitElement instanceof VoltageSource ) {
          endVertex.voltageProperty.value = startVertex.voltageProperty.value + sign * circuitElement.voltageProperty.value;
          solvedVertices.push( endVertex );
        }
        else if ( circuitElement instanceof Capacitor || circuitElement instanceof Inductor ) {
          endVertex.voltageProperty.value = startVertex.voltageProperty.value - sign * circuitElement.mnaVoltageDrop;
          solvedVertices.push( endVertex );
        }
        else {
          affirm( false, 'unknown circuit element type: ' + circuitElement.constructor.name );
        }
      }
    };

    const visited: Vertex[] = [];
    const dfs = ( vertex: Vertex, visit: ( v: Vertex, circuitElement: CircuitElement, opposite: Vertex ) => void ) => {
      visited.push( vertex );
      circuit.circuitElements.forEach( circuitElement => {
        if ( circuitElement.containsVertex( vertex ) ) {
          const opposite = circuitElement.getOppositeVertex( vertex );
          if ( !visited.includes( opposite ) && circuitElement.isTraversableProperty.value ) {
            visit( vertex, circuitElement, opposite );
            dfs( opposite, visit );
          }
        }
      } );
    };

    // Start visiting from the solved vertices, since they have the ground truth.  Have to visit each to make sure
    // we traveled to all disconnected components
    const allVertices = [ ...solvedVertices, ...unsolvedVertices ];
    allVertices.forEach( vertex => {
      if ( !visited.includes( vertex ) ) {
        dfs( vertex, visitVoltage );
      }
    } );

    // Depth first search across the circuit to ensure current conserved at each vertex
    // circuit.checkCurrentConservation( 'before' );
    const locked = [ ...nonParticipants ];
    const visitCurrent = ( vertex: Vertex ) => circuit.conserveCurrent( vertex, locked );
    visited.length = 0;
    allVertices.forEach( vertex => dfs( vertex, visitCurrent ) );
    // circuit.checkCurrentConservation( 'after' );

    unsolvedVertices.forEach( v => {
      affirm( visited.includes( v ), 'unsolved vertex ' + v.tandem.phetioID + ' should be visited.' );
    } );
  }
}

circuitConstructionKitCommon.register( 'LinearTransientAnalysis', LinearTransientAnalysis );