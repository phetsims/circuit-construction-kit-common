// Copyright 2019-2021, University of Colorado Boulder

/**
 * Takes a Circuit, creates a corresponding DynamicCircuit, solves the DynamicCircuit and applies the results back
 * to the original Circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

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
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';
import DynamicCircuitResistiveBattery from './DynamicCircuitResistiveBattery.js';
import DynamicInductor from './DynamicInductor.js';
import DynamicElementState from './DynamicElementState.js';
import CCKCUtils from '../../CCKCUtils.js';
import DynamicCapacitor from './DynamicCapacitor.js';

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
    const dynamicCapacitors = [];
    const dynamicInductors = [];

    // Identify CircuitElements that are not in a loop with a voltage source. They will have their currents zeroed out.
    const nonParticipants = [];
    const participants = [];
    const backwardMap = new Map<any, CircuitElement>();
    for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
      const circuitElement = circuit.circuitElements[ i ];

      const inLoop = circuit.isInLoop( circuitElement );

      if ( inLoop ) {
        participants.push( circuitElement );
        if ( circuitElement instanceof VoltageSource ) {
          const dynamicCircuitResistiveBattery = new DynamicCircuitResistiveBattery(
            circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '',
            circuitElement.voltageProperty.value,
            circuitElement.internalResistanceProperty.value
          );
          backwardMap.set( dynamicCircuitResistiveBattery, circuitElement );
          resistiveBatteryAdapters.push( dynamicCircuitResistiveBattery );
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

          const resistorAdapter = new ModifiedNodalAnalysisCircuitElement( circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '', null, resistance );
          backwardMap.set( resistorAdapter, circuitElement );
          resistorAdapters.push( resistorAdapter );
        }
        else if ( circuitElement instanceof Switch && !circuitElement.closedProperty.value ) {

          // no element for an open switch
        }
        else if ( circuitElement instanceof Capacitor ) {

          const dynamicCapacitor = new DynamicCapacitor( circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '', new DynamicElementState( circuitElement.mnaVoltageDrop, circuitElement.mnaCurrent ), circuitElement.capacitanceProperty.value );
          dynamicCapacitors.push( dynamicCapacitor );
          backwardMap.set( dynamicCapacitor, circuitElement );
        }
        else if ( circuitElement instanceof Inductor ) {

          const dynamicInductor = new DynamicInductor(
            circuitElement.startVertexProperty.value.index + '',
            circuitElement.endVertexProperty.value.index + '',
            new DynamicElementState( circuitElement.mnaVoltageDrop, circuitElement.mnaCurrent ),
            circuitElement.inductanceProperty.value
          );
          backwardMap.set( dynamicInductor, circuitElement );
          dynamicInductors.push( dynamicInductor );
        }
        else {
          assert && assert( false, `Type not found: ${circuitElement.constructor.name}` );
        }
      }
      else {
        nonParticipants.push( circuitElement );
      }
    }

    const dynamicCircuit = new DynamicCircuit( resistorAdapters, resistiveBatteryAdapters, dynamicCapacitors, dynamicInductors );
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
        const battery = backwardMap.get( batteryAdapter ) as VoltageSource;
        batteryAdapter.resistance = battery.internalResistanceProperty.value;
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

    resistiveBatteryAdapters.forEach( batteryAdapter => {
      const circuitElement = backwardMap.get( batteryAdapter ) as VoltageSource;
      circuitElement.currentProperty.value = circuitResult.getTimeAverageCurrent( batteryAdapter );
    } );
    resistorAdapters.forEach( resistorAdapter => {
      const circuitElement = backwardMap.get( resistorAdapter )!;
      circuitElement.currentProperty.value = circuitResult.getTimeAverageCurrent( resistorAdapter );
    } );
    dynamicCapacitors.forEach( dynamicCapacitor => {
      const capacitor = backwardMap.get( dynamicCapacitor ) as Capacitor;
      capacitor.currentProperty.value = circuitResult.getTimeAverageCurrentForCapacitor( dynamicCapacitor );
      capacitor.mnaCurrent = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousCurrentForCapacitor( dynamicCapacitor ) );

      assert && assert( typeof dynamicCapacitor.capacitorVoltageNode1 === 'string' );
      assert && assert( typeof dynamicCapacitor.capacitorVoltageNode0 === 'string' );

      // TODO: this is done differently for inductor, see https://github.com/phetsims/circuit-construction-kit-common/issues/764
      if ( typeof dynamicCapacitor.capacitorVoltageNode0 === 'string' && typeof dynamicCapacitor.capacitorVoltageNode1 === 'string' ) {
        capacitor.mnaVoltageDrop = CCKCUtils.clampMagnitude( circuitResult.getFinalState().dynamicCircuitSolution!.getNodeVoltage( dynamicCapacitor.capacitorVoltageNode1 )
                                                             - circuitResult.getFinalState().dynamicCircuitSolution!.getNodeVoltage( dynamicCapacitor.capacitorVoltageNode0 ) );
      }

      assert && assert( Math.abs( capacitor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
      assert && assert( Math.abs( capacitor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
    } );
    dynamicInductors.forEach( dynamicInductor => {

      const inductor = backwardMap.get( dynamicInductor ) as Inductor;

      // TODO: This line is seemingly wrong https://github.com/phetsims/circuit-construction-kit-common/issues/758
      inductor.currentProperty.value = -circuitResult.getTimeAverageCurrentForInductor( dynamicInductor );
      inductor.mnaCurrent = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousCurrentForInductor( dynamicInductor ) );
      inductor.mnaVoltageDrop = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousVoltageForInductor( dynamicInductor ) );
      assert && assert( Math.abs( inductor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
      assert && assert( Math.abs( inductor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
    } );

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