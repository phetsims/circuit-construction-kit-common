// Copyright 2019-2020, University of Colorado Boulder

/**
 * ModifiedNodalAnalysisCircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */


// modules
// const ModifiedNodalAnalysisCircuit = require( '/circuit-construction-kit-common/js/model/ModifiedNodalAnalysisCircuit' );
// const ModifiedNodalAnalysisSolution = require( '/circuit-construction-kit-common/js/model/ModifiedNodalAnalysisSolution' );
import DynamicCircuit from './DynamicCircuit.js';
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';

QUnit.module( 'DynamicCircuit' );

// const approxEquals = ( a, b ) => Math.abs( a - b ) < 1E-6;

const testVRCCircuit = ( v, r, c, assert ) => {
  const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, r );
  const battery = new DynamicCircuit.ResistiveBattery( 0, 1, v, 0 );
  const capacitor = new DynamicCircuit.DynamicCapacitor(
    new DynamicCircuit.Capacitor( 2, 0, c ),
    new DynamicCircuit.DynamicElementState( 0.0, v / r )
  );
  let dynamicCircuit = new DynamicCircuit( [ resistor ], [ battery ], [ capacitor ], [] );

  const dt = 1E-4;
  // console.log( 'voltage\n' );
  for ( let i = 0; i < 1000; i++ ) {//takes 0.3 sec on my machine
    const t = i * dt;

    const companionSolution = dynamicCircuit.solveItWithSubdivisions( dt );
    const voltage = companionSolution.getVoltage( resistor );
    const desiredVoltageAtTPlusDT = -v * Math.exp( -( t + dt ) / r / c );
    const error = Math.abs( voltage - desiredVoltageAtTPlusDT );
    // console.log( -voltage );
    assert.ok( error < 1E-6 ); //sample run indicates largest error is 1.5328E-7, is this acceptable?  See TestRCCircuit
    dynamicCircuit = dynamicCircuit.updateWithSubdivisions( dt );
  }
};

// This is for comparison with TestTheveninCapacitorRC
QUnit.test( 'testVRC991Eminus2', assert => {
  testVRCCircuit( 9, 9, 1E-2, assert );
} );

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

const testVRLCircuit = ( V, R, L, assert ) => {
  const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, R );
  const battery = new DynamicCircuit.ResistiveBattery( 0, 1, V, 0 );
  const inductor = new DynamicCircuit.DynamicInductor( new DynamicCircuit.Inductor( 2, 0, L ), new DynamicCircuit.DynamicElementState( V, 0.0 ) );
  let circuit = new DynamicCircuit( [ resistor ], [ battery ], [], [ inductor ] );

  const dt = 1E-4;
  for ( let i = 0; i < 1000; i++ ) {
    const t = i * dt;
    const solution = circuit.solveItWithSubdivisions( dt );
    const current = solution.getCurrent( resistor );
    const expectedCurrent = V / R * ( 1 - Math.exp( -( t + dt ) * R / L ) );//positive, by definition of MNA.Battery
    const error = Math.abs( current - expectedCurrent );
    assert.ok( error < 1E-4 );
    circuit = circuit.updateWithSubdivisions( dt );
  }
};

QUnit.test( 'test_RL_Circuit_should_have_correct_behavior_for_V_5_R_10_L_1', assert => {
  testVRLCircuit( 5, 10, 1, assert );
} );

QUnit.test( 'test_RL_Circuit_should_have_correct_behavior_for_V_3_R_11_L_2_5', assert => {
  testVRLCircuit( 3, 11, 2.5, assert );
} );

QUnit.test( 'test_RL_Circuit_should_have_correct_behavior_for_V_7_R_13_L_1E4', assert => {
  testVRLCircuit( 7, 13, 1E4, assert );
} );

QUnit.test( 'test_RL_Circuit_should_have_correct_behavior_for_V_7_R_13_L_1Eminus4', assert => {
  testVRLCircuit( 7, 13, 1E-4, assert );
} );