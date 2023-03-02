// Copyright 2019-2023, University of Colorado Boulder

/**
 * Takes a Circuit, creates a corresponding LTACircuit, solves the LTACircuit and applies the results back
 * to the original Circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import Capacitor from '../Capacitor.js';
import LTACircuit from './LTACircuit.js';
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
import LTAState from './LTAState.js';
import Vertex from '../Vertex.js';
import CircuitElement from '../CircuitElement.js';
import CCKCConstants from '../../CCKCConstants.js';
import LTAResistiveBattery from './LTAResistiveBattery.js';
import LTAInductor from './LTAInductor.js';
import CCKCUtils from '../../CCKCUtils.js';
import LTACapacitor from './LTACapacitor.js';
import MNAResistor from './mna/MNAResistor.js';

// constants
const TIMESTEP_SUBDIVISIONS = new TimestepSubdivisions<LTAState>();

let id = 0;

export default class LinearTransientAnalysis {

  /**
   * Solves the system with Modified Nodal Analysis, and apply the results back to the Circuit.
   */
  public static solveModifiedNodalAnalysis( circuit: Circuit, dt: number ): void {

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
        if ( circuitElement instanceof VoltageSource ) {
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
                  circuitElement instanceof Fuse ||
                  circuitElement instanceof Wire ||
                  circuitElement instanceof LightBulb ||
                  circuitElement instanceof SeriesAmmeter ||

                  // Since no closed circuit there; see below where current is zeroed out
                  ( circuitElement instanceof Switch && circuitElement.isClosedProperty.value ) ) {

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
        else if ( circuitElement instanceof Switch && !circuitElement.isClosedProperty.value ) {

          // no element for an open switch
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
          assert && assert( false, `Type not found: ${circuitElement.constructor.name}` );
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

      assert && assert( Math.abs( capacitor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
      assert && assert( Math.abs( capacitor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
    } );
    ltaInductors.forEach( ltaInductor => {

      const inductor = inductorMap.get( ltaInductor )!;
      inductor.currentProperty.value = circuitResult.getTimeAverageCurrentForCoreModel( ltaInductor );
      inductor.mnaCurrent = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousCurrentForCoreModel( ltaInductor ) );
      inductor.mnaVoltageDrop = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousVoltageForCoreModel( ltaInductor ) );
      assert && assert( Math.abs( inductor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
      assert && assert( Math.abs( inductor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
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
        if ( circuitElement instanceof Resistor || circuitElement instanceof Wire || circuitElement instanceof LightBulb ||
             ( circuitElement instanceof Switch && circuitElement.isClosedProperty.value ) || circuitElement instanceof Fuse ||
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
        else if ( circuitElement instanceof Switch && !circuitElement.isClosedProperty.value ) {
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
          if ( !visited.includes( opposite ) && !( circuitElement instanceof Switch && !circuitElement.isClosedProperty.value ) ) {
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
      assert && assert( visited.includes( v ), 'unsolved vertex ' + v.tandem.phetioID + ' should be visited.' );
    } );
  }
}

circuitConstructionKitCommon.register( 'LinearTransientAnalysis', LinearTransientAnalysis );