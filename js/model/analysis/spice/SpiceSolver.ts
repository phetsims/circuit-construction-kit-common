// Copyright 2025, University of Colorado Boulder

/**
 * SpiceSolver is an interface for circuit solvers that use SPICE (e.g. ngspice WASM).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import affirm from '../../../../../perennial-alias/js/browser-and-node/affirm.js';
import CCKCConstants from '../../../CCKCConstants.js';
import CCKCUtils from '../../../CCKCUtils.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import Capacitor from '../../Capacitor.js';
import type Circuit from '../../Circuit.js';
import type CircuitElement from '../../CircuitElement.js';
import CircuitGroup from '../../CircuitGroup.js';
import Fuse from '../../Fuse.js';
import Inductor from '../../Inductor.js';
import LightBulb from '../../LightBulb.js';
import Resistor from '../../Resistor.js';
import SeriesAmmeter from '../../SeriesAmmeter.js';
import Switch from '../../Switch.js';
import type Vertex from '../../Vertex.js';
import VoltageSource from '../../VoltageSource.js';
import Wire from '../../Wire.js';
import SpiceAdapter from '../spice/SpiceAdapter.js';
import SpiceSolverManager from '../spice/SpiceSolverManager.js';
import MNABattery from '../mna/MNABattery.js';
import MNACapacitor from '../mna/MNACapacitor.js';
import MNAInductor from '../mna/MNAInductor.js';
import MNAResistor from '../mna/MNAResistor.js';
import MNASolution from '../mna/MNASolution.js';

export default class SpiceSolver {


  /**
   * Solve using SPICE solver (async with callbacks).
   * Supports DC and AC circuits with batteries, resistors, capacitors, and inductors.
   *
   * IMPORTANT: SPICE cannot handle disconnected subcircuits in a single solve.
   * We use circuit.getGroups() to find connected components and solve each one separately.
   * When each solve completes, a callback applies results directly to circuit elements.
   */
  public static solveWithSpice( circuit: Circuit, dt: number ): void {

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
      this.solveGroup( circuit, group, dt );
    }
  }

  /**
   * Build MNA elements and request a solve for a single connected component (group).
   * When the solve completes, the callback applies results directly to circuit elements.
   */
  private static solveGroup( circuit: Circuit, group: CircuitGroup, dt: number ): void {
    const batteries: MNABattery[] = [];
    const resistors: MNAResistor[] = [];
    const capacitors: MNACapacitor[] = [];
    const inductors: MNAInductor[] = [];

    const batteryMap = new Map<string, VoltageSource>();
    const batteryMNAMap = new Map<string, MNABattery>();
    const resistorMap = new Map<string, CircuitElement>();
    const capacitorMap = new Map<string, Capacitor>();
    const capacitorMNAMap = new Map<string, MNACapacitor>();
    const inductorMap = new Map<string, Inductor>();
    const inductorMNAMap = new Map<string, MNAInductor>();
    const nonParticipants: CircuitElement[] = [];

    for ( const circuitElement of group.circuitElements ) {

      // Skip non-traversable elements (like open switches)
      if ( !circuitElement.isTraversableProperty.value ) {
        nonParticipants.push( circuitElement );
        continue;
      }

      const nodeId0 = circuitElement.startVertexProperty.value.index + '';
      const nodeId1 = circuitElement.endVertexProperty.value.index + '';

      if ( circuitElement instanceof VoltageSource ) {
        // For AC sources, voltageProperty already has the instantaneous value from ACVoltage.step()
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
      else if ( circuitElement instanceof Capacitor ) {
        // Use mnaVoltageDrop as the initial condition (from previous timestep)
        const capacitor = new MNACapacitor(
          nodeId0,
          nodeId1,
          circuitElement.capacitanceProperty.value,
          circuitElement.mnaVoltageDrop
        );
        capacitors.push( capacitor );
        const key = `${nodeId0}_${nodeId1}`;
        capacitorMap.set( key, circuitElement );
        capacitorMNAMap.set( key, capacitor );
      }
      else if ( circuitElement instanceof Inductor ) {
        // Use mnaCurrent as the initial condition (from previous timestep)
        const inductor = new MNAInductor(
          nodeId0,
          nodeId1,
          circuitElement.inductanceProperty.value,
          circuitElement.mnaCurrent
        );
        inductors.push( inductor );
        const key = `${nodeId0}_${nodeId1}`;
        inductorMap.set( key, circuitElement );
        inductorMNAMap.set( key, inductor );
      }
    }

    // Skip if no batteries after filtering
    if ( batteries.length === 0 ) {
      return;
    }

    // Request solve with callback that applies results when complete
    SpiceSolverManager.instance.requestSolve(
      batteries,
      resistors,
      capacitors,
      inductors,
      dt,
      ( solution: MNASolution, adapter: SpiceAdapter ) => {
        this.applyEEcircuitSolution(
          circuit, solution, adapter,
          batteryMap, batteryMNAMap, resistorMap,
          capacitorMap, capacitorMNAMap,
          inductorMap, inductorMNAMap,
          nonParticipants
        );
      }
    );
  }

  /**
   * Apply EEcircuit solution back to the circuit elements.
   */
  private static applyEEcircuitSolution(
    circuit: Circuit,
    solution: MNASolution,
    adapter: SpiceAdapter,
    batteryMap: Map<string, VoltageSource>,
    batteryMNAMap: Map<string, MNABattery>,
    resistorMap: Map<string, CircuitElement>,
    capacitorMap: Map<string, Capacitor>,
    capacitorMNAMap: Map<string, MNACapacitor>,
    inductorMap: Map<string, Inductor>,
    inductorMNAMap: Map<string, MNAInductor>,
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

    // Apply currents and state to capacitors
    for ( const [ key, capacitor ] of capacitorMap ) {
      const mnaCapacitor = capacitorMNAMap.get( key );
      if ( mnaCapacitor ) {
        // Get current from SPICE solution
        const current = solution.getSolvedCurrent( mnaCapacitor );
        capacitor.currentProperty.value = current;

        // Update state for next timestep
        // mnaCurrent stores the instantaneous current for state continuity
        capacitor.mnaCurrent = CCKCUtils.clampMagnitude( current );

        // mnaVoltageDrop stores the voltage across the capacitor
        // Get voltage from node voltages
        const capVoltage = adapter.getCapacitorVoltage( solution, mnaCapacitor );
        // const prevVoltageDrop = capacitor.mnaVoltageDrop;
        capacitor.mnaVoltageDrop = CCKCUtils.clampMagnitude( capVoltage );

        // Debug: log state update
        // console.log( '[LTA] Capacitor state update:', {
        //   prevVoltageDrop: prevVoltageDrop,
        //   newVoltageDrop: capacitor.mnaVoltageDrop,
        //   current: current,
        //   initialVoltageUsed: mnaCapacitor.initialVoltage
        // } );
      }
      else {
        capacitor.currentProperty.value = 0;
      }
    }

    // Apply currents and state to inductors
    for ( const [ key, inductor ] of inductorMap ) {
      const mnaInductor = inductorMNAMap.get( key );
      if ( mnaInductor ) {
        // Get current from SPICE solution
        const current = solution.getSolvedCurrent( mnaInductor );
        inductor.currentProperty.value = current;

        // Update state for next timestep
        // mnaCurrent stores the instantaneous current for state continuity (initial condition for next step)
        inductor.mnaCurrent = CCKCUtils.clampMagnitude( current );

        // mnaVoltageDrop stores the voltage across the inductor
        const [ nodeId0, nodeId1 ] = key.split( '_' );
        const v0 = solution.getNodeVoltage( nodeId0 ) ?? 0;
        const v1 = solution.getNodeVoltage( nodeId1 ) ?? 0;
        inductor.mnaVoltageDrop = CCKCUtils.clampMagnitude( v0 - v1 );
      }
      else {
        inductor.currentProperty.value = 0;
      }
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

      if ( !circuitElement.isTraversableProperty.value ) {
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
          if ( !visited.includes( opposite ) && circuitElement.isTraversableProperty.value ) {
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

}

circuitConstructionKitCommon.register( 'SpiceSolver', SpiceSolver );