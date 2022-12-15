// Copyright 2015-2022, University of Colorado Boulder

/**
 * MNACircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import MNACircuit from './MNACircuit.js';
import MNASolution from './MNASolution.js';
import MNAResistor from './MNAResistor.js';
import MNABattery from './MNABattery.js';
import MNACurrent from './MNACurrent.js';
import MNACircuitElement from './MNACircuitElement.js';

QUnit.module( 'MNACircuitTests' );

const approxEquals = ( a: number, b: number ) => Math.abs( a - b ) < 1E-6;

QUnit.test( 'test_should_be_able_to_obtain_current_for_a_resistor', assert => {
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor = new MNAResistor( '1', '0', 2.0 );
  const solution = new MNACircuit( [ battery ], [ resistor ], [] ).solve();
  const desiredSolution = new MNASolution( new Map( [
    [ '0', 0 ],
    [ '1', -4 ]
  ] ), new Map<MNACircuitElement, number>( [
    [ battery, 2.0 ]
  ] ) );
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solution should match' );

  // same magnitude as battery: positive because current flows from node 1 to 0
  assert.equal(
    approxEquals( solution.getCurrentForResistor( resistor ), -2 ), true, 'current through resistor should be 2.0 Amps'
  );
} );

QUnit.test( 'test_an_unconnected_resistor_shouldnt_cause_problems', assert => {
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor1 = new MNAResistor( '1', '0', 4.0 );
  const resistor2 = new MNAResistor( '2', '3', 100 );
  const circuit = new MNACircuit( [ battery ], [ resistor1, resistor2 ], [] );
  const desiredSolution = new MNASolution( new Map( [
    [ '0', 0 ],
    [ '1', -4 ],
    [ '2', 0 ],
    [ '3', 0 ]
  ] ), new Map<MNACircuitElement, number>( [
    [ battery, 1.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );


QUnit.test( 'test_current_should_be_reversed_when_voltage_is_reversed', assert => {
  const battery = new MNABattery( '0', '1', -4 );
  const resistor = new MNAResistor( '1', '0', 2 );
  const circuit = new MNACircuit( [ battery ], [ resistor ], [] );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ '1', 4 ]
  ] );

  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>( [
    [ battery, -2.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'test_two_batteries_in_series_should_have_voltage_added', assert => {
  const battery1 = new MNABattery( '0', '1', -4 );
  const battery2 = new MNABattery( '1', '2', -4 );
  const resistor1 = new MNAResistor( '2', '0', 2.0 );
  const circuit = new MNACircuit( [ battery1, battery2 ], [ resistor1 ], [] );

  const desiredSolution = new MNASolution( new Map( [
    [ '0', 0 ],
    [ '1', 4 ],
    [ '2', 8 ]
  ] ), new Map<MNACircuitElement, number>( [
    [ battery1, -4.0 ],
    [ battery2, -4.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'test_two_resistors_in_series_should_have_resistance_added', assert => {
  const battery = new MNABattery( '0', '1', 5.0 );
  const resistor1 = new MNAResistor( '1', '2', 10.0 );
  const resistor2 = new MNAResistor( '2', '0', 10.0 );
  const circuit = new MNACircuit( [ battery ], [
    resistor1,
    resistor2
  ], [] );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ '1', -5 ],
    [ '2', -2.5 ]
  ] );
  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>( [
    [ battery, 5 / 20.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'test_A_resistor_with_one_node_unconnected_shouldnt_cause_problems', assert => {
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor1 = new MNAResistor( '1', '0', 4.0 );
  const resistor2 = new MNAResistor( '0', '2', 100.0 );
  const circuit = new MNACircuit(
    [ battery ],
    [ resistor1, resistor2 ], []
  );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ '1', -4 ],
    [ '2', 0 ]
  ] );
  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>( [
    [ battery, 1.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'test_an_unconnected_resistor_shouldnt_cause_problems', assert => {
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor1 = new MNAResistor( '1', '0', 4.0 );
  const resistor2 = new MNAResistor( '2', '3', 100.0 );
  const circuit = new MNACircuit( [ battery ], [
    resistor1,
    resistor2
  ], [] );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ '1', -4 ],
    [ '2', 0 ],
    [ '3', 0 ]
  ] );

  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>( [
    [ battery, 1.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'test_should_handle_resistors_with_no_resistance', assert => {
  const battery = new MNABattery( '0', '1', 5 );
  const resistor = new MNAResistor( '2', '0', 0 );
  const resistor0 = new MNAResistor( '1', '2', 10 );
  const circuit = new MNACircuit( [ battery ], [
    resistor0,
    resistor
  ], [] );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ '1', -5 ],
    [ '2', 0 ]
  ] );
  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>( [
    [ battery, 5 / 10 ],
    [ resistor, 5 / 10 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'test_resistors_in_parallel_should_have_harmonic_mean_of_resistance', assert => {
  const V = 9.0;
  const R1 = 5.0;
  const R2 = 5.0;
  const Req = 1 / ( 1 / R1 + 1 / R2 );
  const battery = new MNABattery( '0', '1', V );
  const resistor1 = new MNAResistor( '1', '0', R1 );
  const resistor2 = new MNAResistor( '1', '0', R2 );
  const circuit = new MNACircuit( [ battery ], [
    resistor1,
    resistor2
  ], [] );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ '1', -V ]
  ] );

  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>( [
    [ battery, V / Req ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

// ( () => {
//
// // http://zacg.github.io/blog/2013/08/02/binary-combinations-in-javascript/
//   function binaryCombos( n: number ) {
//     const result = [];
//     for ( let y = 0; y < Math.pow( 2, n ); y++ ) {
//       const combo = [];
//       for ( let x = 0; x < n; x++ ) {
//         //shift bit and and it with 1
//         if ( ( y >> x ) & 1 ) {
//           combo.push( true );
//         }
//         else {
//           combo.push( false );
//         }
//       }
//       result.push( combo );
//     }
//     return result;
//   }
//
// //Usage
//   const combos = binaryCombos( 7 );
//   console.log( 'testing ' + combos.length + ' combos' );
//
//   for ( let x = 0; x < combos.length; x++ ) {
//     // console.log( combos[ x ].join( ',' ) );
//
//     window.signs = combos[ x ].map( t => t ? 1 : -1 );
//
//     const v1 = new MNABattery( '1', '0', 24 );
//     const v2 = new MNABattery( '3', '0', 15 );
//     const r1 = new MNAResistor( '1', '2', 10000 );
//     const r2 = new MNAResistor( '2', '3', 8100 );
//     const r3 = new MNAResistor( '2', '0', 4700 );
//
//     const circuit = new MNACircuit( [ v1, v2 ], [ r1, r2, r3 ], [] );
//     const solution = circuit.solve();
//
//     // console.log( solution.getNodeVoltage( '0' ) );
//     // console.log( solution.getNodeVoltage( '1' ) );
//     // console.log( solution.getNodeVoltage( '2' ) );
//     // console.log( solution.getNodeVoltage( '3' ) );
//     // console.log( solution.getSolvedCurrent( v1 ) );
//     // console.log( solution.getSolvedCurrent( v2 ) );
//
//     let wins = 0;
//     if ( approxEquals2( solution.getNodeVoltage( '0' ), 0 ) ) { wins++; }
//     if ( approxEquals2( solution.getNodeVoltage( '1' ), 24 ) ) { wins++; }
//     if ( approxEquals2( solution.getNodeVoltage( '2' ), 9.7470 ) ) { wins++; }
//     if ( approxEquals2( solution.getNodeVoltage( '3' ), 15.0 ) ) { wins++; }
//     if ( approxEquals2( solution.getSolvedCurrent( v1 ), -1.425E-3 ) ) { wins++; }
//     if ( approxEquals2( solution.getSolvedCurrent( v2 ), -6.485E-4 ) ) { wins++; }
//
//
//     console.log( 'wins: ' + wins );
//     if ( wins === 6 ) {
//       console.log( window.signs );
//     }
//   }
//
//   // v1 1 0 dc 24V
//   // v2 3 0 dc 15V
//   // r1 1 2 10000 Ohms
//   // r2 2 3 8100 Ohms
//   // r3 2 0 4700 Ohms
//
//   // node voltages: (1) 24.0000 (2) 9.7470 (3) 15.0000
//   // voltage source currents: (v1) -1.425E-03 (v2) -6.485E-04
//
// } )();

// Netlist example at https://www.allaboutcircuits.com/textbook/reference/chpt-7/example-circuits-and-netlists/
QUnit.test( 'Netlist: 2 batteries & 3 resistors', assert => {

  const v1 = new MNABattery( '1', '0', 24 );
  const v2 = new MNABattery( '3', '0', 15 );
  const r1 = new MNAResistor( '1', '2', 10000 );
  const r2 = new MNAResistor( '2', '3', 8100 );
  const r3 = new MNAResistor( '2', '0', 4700 );

  const circuit = new MNACircuit( [ v1, v2 ], [ r1, r2, r3 ], [] );

  const desiredSolution = new MNASolution( new Map( [
    [ '0', 0 ],
    [ '1', 24.0 ],
    [ '2', 9.7470 ],
    [ '3', 15.0 ]
  ] ), new Map<MNACircuitElement, number>( [
    [ v1, -1.425E-3 ],
    [ v2, -6.485E-4 ]
  ] ) );
  const solution = circuit.solve();

  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'Netlist: 1 battery and 1 resistor', assert => {
  const v1 = new MNABattery( 'a', '0', 9 );
  const r1 = new MNAResistor( 'a', '0', 9 );
  const circuit = new MNACircuit( [ v1 ], [ r1 ], [] );
  const desiredSolution = new MNASolution( new Map( [ [ 'a', 9 ], [ '0', 0 ] ] ), new Map( [ [ v1, -1.0 ] ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'Netlist: 1 battery and 1 resistor: part 2', assert => {
  const v1 = new MNABattery( 'a', '0', 10 );
  const r1 = new MNAResistor( 'a', '0', 5 );
  const circuit = new MNACircuit( [ v1 ], [ r1 ], [] );
  const desiredSolution = new MNASolution( new Map( [ [ 'a', 10 ], [ '0', 0 ] ] ), new Map( [ [ v1, -2.0 ] ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

// Compare to the example at https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic/ee-dc-circuit-analysis/a/ee-node-voltage-method
QUnit.test( 'Netlist: khan ee', assert => {
  const battery = new MNABattery( 'a', 'c', 140 );
  const resistor1 = new MNAResistor( 'a', 'b', 20 );
  const resistor2 = new MNAResistor( 'b', 'c', 6 );
  const resistor3 = new MNAResistor( 'b', 'c', 5 );
  const current = new MNACurrent( 'c', 'b', 18 );
  const circuit = new MNACircuit( [ battery ], [ resistor1, resistor2, resistor3 ], [ current ] );

  const offset = -140;
  const voltageMap = new Map( [
    [ 'a', 140 + offset ],
    [ 'b', 60 + offset ],
    [ 'c', 0 + offset ]
  ] );

  const desiredSolution = new MNASolution( voltageMap, new Map( [
    [ battery, -4.0 ]
  ] ) );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

QUnit.test( 'netlist: ir', assert => {
  const currentSource = new MNACurrent( '0', 'a', 10 );
  const resistor = new MNAResistor( 'a', '0', 4 );
  const circuit = new MNACircuit( [], [ resistor ], [ currentSource ] );
  const voltageMap = new Map( [
    [ '0', 0 ],
    [ 'a', 40.0 ]
  ] );
  const desiredSolution = new MNASolution( voltageMap, new Map<MNACircuitElement, number>() );
  const solution = circuit.solve();
  assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
} );

// const findOperatingPointForLRCircuit = ( V: number, R: number, L: number ) => {
//   let id = 0;
//   const resistor = new MNAResistor( '1', '2', R );
//   const battery = new MNABattery( '0', '1', V );
//   const myResistor = new MNAResistor( '2', '0', 1 );
//   const circuit = new MNACircuit( [ battery ], [ resistor, myResistor ], [] );
//   // iterateInductor( circuit, resistor, V, R, L, assert );
//   const x = circuit.solve();
// };
//
// findOperatingPointForLRCircuit( 5, 10, 1 );