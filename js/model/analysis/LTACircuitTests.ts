// Copyright 2019-2022, University of Colorado Boulder

/**
 * MNACircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// modules
import LTACircuit from './LTACircuit.js';
import LTACapacitor from './LTACapacitor.js';
import LTAInductor from './LTAInductor.js';
import LTAResistiveBattery from './LTAResistiveBattery.js';
import MNAResistor from './mna/MNAResistor.js';

const ITERATIONS = 250;
QUnit.module( 'LTACircuit' );
const dt = 1 / 60;

let id = 0;

let worstError = 0;

// window.string = `{v}  {r}  {c}  {t}  {desiredVoltageAtTPlusDT}  {voltage}  {error}
// `;
// Check the values coming from an RC circuit (may be an equivalent capacitance)
const iterateCapacitor = ( circuit: LTACircuit, resistor: MNAResistor, v: number, r: number, c: number, assert: Assert ) => {
  for ( let i = 0; i < ITERATIONS; i++ ) {
    const t = i * dt;

    const companionSolution = circuit.solveItWithSubdivisions( dt );
    const actualVoltage = companionSolution!.getVoltage( resistor.nodeId0, resistor.nodeId1 );
    const expectedVoltage = v * Math.exp( -( t + dt ) / r / c );
    const error = Math.abs( actualVoltage - expectedVoltage );

    // console.log( expectedVoltage, actualVoltage );
    // console.log( error );
    if ( error > worstError ) {
      worstError = error;
      // console.log( 'new worst error: ' + worstError );
    }

    // window.string = window.string + `${v}  ${r}  ${c}  ${t}  ${desiredVoltageAtTPlusDT}  ${voltage}  ${error}
// `;

    const fractionalError = error / expectedVoltage;
    // console.log( fractionalError, error );
    if ( error > 1E-8 ) {
      assert.ok( fractionalError <= 0.02 ); // sample run indicates largest error is 1.5328E-7
    }

    circuit = circuit.updateWithSubdivisions( dt );
  }
};

const testVRCCircuit = ( v: number, r: number, c: number, assert: Assert ) => {
  const resistor = new MNAResistor( '1', '2', r );
  const battery = new LTAResistiveBattery( id++, '0', '1', v, 0 );
  const capacitor = new LTACapacitor( id++, '2', '0', 0.0, v / r, c );
  const circuit = new LTACircuit( [ resistor ], [ battery ], [ capacitor ], [] );
  iterateCapacitor( circuit, resistor, v, r, c, assert );
};

const testVRCCircuitSeriesCapacitors = ( v: number, r: number, c1: number, c2: number, assert: Assert ) => {

  const ceq = 1 / ( 1 / c1 + 1 / c2 );
  const resistor = new MNAResistor( '1', '2', r );
  const battery = new LTAResistiveBattery( id++, '0', '1', v, 0 );
  const capacitor1 = new LTACapacitor( id++, '2', '3', 0.0, v / r, c1 );
  const capacitor2 = new LTACapacitor( id++, '3', '0', 0.0, v / r, c2 );

  const circuit = new LTACircuit( [ resistor ], [ battery ], [ capacitor1, capacitor2 ], [] );

  iterateCapacitor( circuit, resistor, v, r, ceq, assert );
};

const testVRCCircuitParallelCapacitors = ( v: number, r: number, c1: number, c2: number, assert: Assert ) => {

  const ceq = c1 + c2;
  const resistor = new MNAResistor( '1', '2', r );
  const battery = new LTAResistiveBattery( id++, '0', '1', v, 0 );
  const capacitor1 = new LTACapacitor( id++, '2', '0', 0.0, v / r, c1 );
  const capacitor2 = new LTACapacitor( id++, '2', '0', 0.0, v / r, c2 );

  const circuit = new LTACircuit( [ resistor ], [ battery ], [ capacitor1, capacitor2 ], [] );
  iterateCapacitor( circuit, resistor, v, r, ceq, assert );
};

// This is for comparison with TestTheveninCapacitorRC
// QUnit.test( 'testVRC991Eminus2', assert => {
//
//   for ( let v = 0; v < 120; v += 10 ) { // esl
//     for ( let c = 0.05; c <= 0.20; c += 0.05 ) {
//       testVRCCircuit( v, 10, c, assert );
//     }
//   }
// } );

QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 5 r 10 c 1E minus2', assert => {
  testVRCCircuit( 5.0, 10.0, 1.0E-2, assert );
} );

QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 10 r 10 c 1E minus2', assert => {
  testVRCCircuit( 10.0, 10.0, 1.0E-2, assert );
} );

QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 3  r 7  c 1Eminus1', assert => {
  testVRCCircuit( 3, 7, 1E-1, assert );
} );

QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 3  r 7  c 100', assert => {
  testVRCCircuit( 3, 7, 100, assert );
} );

QUnit.test( 'test RC Circuit with series capacitors', assert => {
  testVRCCircuitSeriesCapacitors( 3, 7, 10, 10, assert );
  for ( let i = 0; i < 10; i++ ) {
    testVRCCircuitSeriesCapacitors( 3, 7, Math.random() * 10, Math.random() * 10, assert ); // eslint-disable-line bad-sim-text, bad-sim-text
  }
} );

QUnit.test( 'test RC Circuit with parallel capacitors', assert => {
  testVRCCircuitParallelCapacitors( 3, 7, 10, 10, assert );
  for ( let i = 0; i < 10; i++ ) {
    testVRCCircuitParallelCapacitors( 3, 7, Math.random() * 10, Math.random() * 10, assert ); // eslint-disable-line bad-sim-text, bad-sim-text
  }
} );

const iterateInductor = ( circuit: LTACircuit, resistor: MNAResistor, V: number, R: number, L: number, assert: Assert ) => {
  for ( let i = 0; i < ITERATIONS; i++ ) {
    const t = i * dt;
    const solution = circuit.solveItWithSubdivisions( dt );
    const actualCurrent = solution!.getCurrent( resistor )!;
    const expectedCurrent = -V / R * ( 1 - Math.exp( -( t + dt ) * R / L ) );//positive, by definition of MNA.Battery

    // console.log( expectedCurrent, actualCurrent );
    const error = Math.abs( actualCurrent - expectedCurrent );
    const fractionalError = error / expectedCurrent;

    if ( error > 1E-8 ) {
      assert.ok( fractionalError <= 0.02 );
    }
    // assert.ok( error < errorThreshold );
    // assert.ok( true );
    circuit = circuit.updateWithSubdivisions( dt );
  }
};

const testVRLCircuit = ( V: number, R: number, L: number, assert: Assert ) => {
  const resistor = new MNAResistor( '1', '2', R );
  const battery = new LTAResistiveBattery( id++, '0', '1', V, 0 );
  const inductor = new LTAInductor( id++, '2', '0', V, 0.0, L );
  const circuit = new LTACircuit( [ resistor ], [ battery ], [], [ inductor ] );
  iterateInductor( circuit, resistor, V, R, L, assert );
};
const testVRLCircuitSeries = ( V: number, R: number, L1: number, L2: number, assert: Assert ) => {
  const Leq = L1 + L2;
  const resistor = new MNAResistor( '1', '2', R );
  const battery = new LTAResistiveBattery( id++, '0', '1', V, 0 );
  const inductor1 = new LTAInductor( id++, '2', '3', 0, 0.0, L1 );
  const inductor2 = new LTAInductor( id++, '3', '0', 0, 0.0, L2 );
  const circuit = new LTACircuit( [ resistor ], [ battery ], [], [ inductor1, inductor2 ] );
  iterateInductor( circuit, resistor, V, R, Leq, assert );
};
const testVRLCircuitParallel = ( V: number, R: number, L1: number, L2: number, assert: Assert ) => {
  const Leq = 1 / ( 1 / L1 + 1 / L2 );
  const resistor = new MNAResistor( '1', '2', R );
  const battery = new LTAResistiveBattery( id++, '0', '1', V, 0 );
  const inductor1 = new LTAInductor( id++, '2', '0', 0, 0.0, L1 );
  const inductor2 = new LTAInductor( id++, '2', '0', 0, 0.0, L2 );
  const circuit = new LTACircuit( [ resistor ], [ battery ], [], [ inductor1, inductor2 ] );
  iterateInductor( circuit, resistor, V, R, Leq, assert );
};

QUnit.test( 'test_RL_Circuit_should_have_correct_behavior', assert => {
  testVRLCircuit( 5, 10, 1, assert );
  testVRLCircuit( 3, 11, 2.5, assert );
  testVRLCircuit( 7, 13, 1E4, assert );
  testVRLCircuit( 7, 13, 1E-1, assert );
} );

QUnit.test( 'Series inductors', assert => {
  testVRLCircuitSeries( 5, 10, 1, 1, assert );
  for ( let i = 0; i < 10; i++ ) {
    testVRLCircuitSeries( 10, 10, 5 * Math.random() + 0.1, 5 * Math.random() + 0.1, assert );// eslint-disable-line bad-sim-text
  }
} );

QUnit.test( 'Parallel inductors', assert => {
  testVRLCircuitParallel( 5, 10, 1, 1, assert );
  for ( let i = 0; i < 10; i++ ) {
    testVRLCircuitParallel( 10, 10, 5 * Math.random() + 1, 5 * Math.random() + 1, assert );// eslint-disable-line bad-sim-text
  }
} );