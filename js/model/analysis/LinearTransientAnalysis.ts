// Copyright 2019-2021, University of Colorado Boulder

/**
 * Takes a Circuit, creates a corresponding DynamicCircuit, solves the DynamicCircuit and applies the results back
 * to the original Circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ResistiveBatteryAdapter from './ResistiveBatteryAdapter.js';
import ResistorAdapter from './ResistorAdapter.js';
import DynamicCapacitorAdapter from './DynamicCapacitorAdapter.js';
import DynamicInductorAdapter from './DynamicInductorAdapter.js';
import CCKCQueryParameters from '../../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import Capacitor from '../Capacitor.js';
import DynamicCircuit from './DynamicCircuit.js';
import Fuse from '../Fuse.js';
import Inductor from '../Inductor.js';
import LightBulb from '../LightBulb.js';
import Resistor from '../Resistor.js';
import SeriesAmmeter from '../SeriesAmmeter.js';
import Switch from '../Switch.js';
import TimestepSubdivisions from './TimestepSubdivisions.js';
import VoltageSource from '../VoltageSource.js';
import Wire from '../Wire.js';
import Circuit from '../Circuit.js';
import DynamicState from './DynamicState.js';
import Vertex from '../Vertex.js';
import CircuitElement from '../CircuitElement.js';
import CCKCConstants from '../../CCKCConstants.js';

// constants
const TIMESTEP_SUBDIVISIONS = new TimestepSubdivisions<DynamicState>();

class LinearTransientAnalysis {

  /**
   * Solves the system with Modified Nodal Analysis, and apply the results back to the Circuit.
   * @param {Circuit} circuit
   * @param {number} dt
   * @public
   */
  static solveModifiedNodalAnalysis( circuit: Circuit, dt: number ) {

    const resistiveBatteryAdapters = [];
    const resistorAdapters = [];
    const capacitorAdapters = [];
    const inductorAdapters = [];

    // Identify CircuitElements that are not in a loop with a voltage source. They will have their currents zeroed out.
    const nonParticipants = [];
    const participants = [];
    for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
      const circuitElement = circuit.circuitElements[ i ];

      const inLoop = circuit.isInLoop( circuitElement );

      if ( inLoop ) {
        participants.push( circuitElement );
        if ( circuitElement instanceof VoltageSource ) {
          resistiveBatteryAdapters.push( new ResistiveBatteryAdapter( circuit, circuitElement ) );
        }
        else if ( circuitElement instanceof Resistor ||
                  circuitElement instanceof Fuse ||
                  circuitElement instanceof Wire ||
                  circuitElement instanceof LightBulb ||
                  circuitElement instanceof SeriesAmmeter ||

                  // Since no closed circuit there; see below where current is zeroed out
                  ( circuitElement instanceof Switch && circuitElement.closedProperty.value ) ) {

          // If a resistor goes to 0 resistance, then we cannot compute the current through as I=V/R.  Therefore,
          // simulate a small amount of resistance.
          const resistance = circuitElement.resistanceProperty.value || CCKCConstants.MINIMUM_RESISTANCE;

          resistorAdapters.push( new ResistorAdapter( circuitElement, resistance ) );
        }
        else if ( circuitElement instanceof Switch && !circuitElement.closedProperty.value ) {

          // no element for an open switch
        }
        else if ( circuitElement instanceof Capacitor ) {
          capacitorAdapters.push( new DynamicCapacitorAdapter( circuitElement ) );
        }
        else if ( circuitElement instanceof Inductor ) {
          inductorAdapters.push( new DynamicInductorAdapter( circuitElement ) );
        }
        else {
          assert && assert( false, `
      Type
      not
      found: ${circuitElement.constructor.name}` );
        }
      }
      else {
        nonParticipants.push( circuitElement );
      }
    }

    const dynamicCircuit = new DynamicCircuit( resistorAdapters, resistiveBatteryAdapters, capacitorAdapters, inductorAdapters );
    let circuitResult = dynamicCircuit.solveWithSubdivisions( TIMESTEP_SUBDIVISIONS, dt );

    // if any battery exceeds its current threshold, increase its resistance and run the solution again.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/245
    let needsHelp = false;

    resistorAdapters.forEach( resistorAdapter => {
      if ( resistorAdapter.circuitElement instanceof LightBulb && resistorAdapter.circuitElement.real ) {

        // @ts-ignore
        resistorAdapter.resistance = 1.0;
        needsHelp = true;
      }
    } );

    resistiveBatteryAdapters.forEach( batteryAdapter => {
      if ( Math.abs( circuitResult.getTimeAverageCurrent( batteryAdapter ) ) > CCKCQueryParameters.batteryCurrentThreshold ) {
        batteryAdapter.resistance = batteryAdapter.battery.internalResistanceProperty.value;
        needsHelp = true;
      }
    } );

    resistorAdapters.forEach( resistorAdapter => {
      if ( resistorAdapter.circuitElement instanceof LightBulb && resistorAdapter.circuitElement.real ) {

        const logWithBase = ( value: number, base: number ) => Math.log( value ) / Math.log( base );

        const v0 = circuitResult.resultSet.getFinalState().dynamicCircuitSolution!.getNodeVoltage( resistorAdapter.nodeId0 );
        const v1 = circuitResult.resultSet.getFinalState().dynamicCircuitSolution!.getNodeVoltage( resistorAdapter.nodeId1 );
        const V = Math.abs( v1 - v0 );

        const base = 2;

        // I = ln(V)
        // V=IR
        // V=ln(V)R
        // R = V/ln(V)

        // Adjust so it looks good in comparison to a standard bulb
        const coefficient = 3;

        // shift by base so at V=0 the log is 1
        resistorAdapter.mnaValue = 10 + coefficient * V / logWithBase( V + base, base );
        resistorAdapter.circuitElement.resistanceProperty.value = resistorAdapter.mnaValue;
      }
    } );

    if ( needsHelp ) {
      // TODO: Could this be causing https://github.com/phetsims/circuit-construction-kit-common/issues/758 ?
      circuitResult = dynamicCircuit.solveWithSubdivisions( TIMESTEP_SUBDIVISIONS, dt );
    }

    resistiveBatteryAdapters.forEach( batteryAdapter => batteryAdapter.applySolution( circuitResult ) );
    resistorAdapters.forEach( resistorAdapter => resistorAdapter.applySolution( circuitResult ) );
    capacitorAdapters.forEach( capacitorAdapter => capacitorAdapter.applySolution( circuitResult ) );
    inductorAdapters.forEach( inductorAdapter => inductorAdapter.applySolution( circuitResult ) );

    // zero out currents on open branches
    nonParticipants.forEach( circuitElement => circuitElement.currentProperty.set( 0 ) );

    const solvedVertices: Vertex[] = [];
    const unsolvedVertices: Vertex[] = [];

    // Apply the node voltages to the vertices
    circuit.vertexGroup.forEach( vertex => {
      const voltage = circuitResult.resultSet.getFinalState().dynamicCircuitSolution!.getNodeVoltage( vertex.index + '' );

      if ( typeof voltage === 'number' ) {
        vertex.voltageProperty.set( voltage );
        solvedVertices.push( vertex );
      }
      else {

        // Unconnected vertices like those in the black box may not have an entry in the matrix, so mark them as zero.
        // Other vertices will be visited in the search below.
        vertex.voltageProperty.set( 0 );
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
        if ( circuitElement instanceof Resistor || circuitElement instanceof Wire || circuitElement instanceof LightBulb ||
             ( circuitElement instanceof Switch && circuitElement.closedProperty.value ) || circuitElement instanceof Fuse ||
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
          endVertex.voltageProperty.value = startVertex.voltageProperty.value + sign * circuitElement.mnaVoltageDrop;
          solvedVertices.push( endVertex );
        }
        else if ( circuitElement instanceof Switch && !circuitElement.closedProperty.value ) {
          // for an open switch, the node voltages are independent
        }
        else {
          assert && assert( false, 'unknown circuit element type: ' + circuitElement.constructor.name );
        }
      }
    };

    const visited: Vertex[] = [];
    const dfs = ( vertex: Vertex, visit: ( v: Vertex, circuitElement: CircuitElement, opposite: Vertex ) => void ) => {
      visited.push( vertex );
      circuit.circuitElements.forEach( circuitElement => {
        if ( circuitElement.containsVertex( vertex ) ) {
          const opposite = circuitElement.getOppositeVertex( vertex );
          if ( !visited.includes( opposite ) && !( circuitElement instanceof Switch && !circuitElement.closedProperty.value ) ) {
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
  }
}

circuitConstructionKitCommon.register( 'LinearTransientAnalysis', LinearTransientAnalysis );
export default LinearTransientAnalysis;