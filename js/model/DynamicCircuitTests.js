// Copyright 2017, University of Colorado Boulder

/**
 * ModifiedNodalAnalysisCircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  // const ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuit' );
  const ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  // const ModifiedNodalAnalysisSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisSolution' );
  const DynamicCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuit' );

  QUnit.module( 'DynamicCircuit' );

  // const approxEquals = ( a, b ) => Math.abs( a - b ) < 1E-6;

  const testVRCCircuit = ( v, r, c, assert ) => {
    const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, r );
    const battery = new DynamicCircuit.ResistiveBattery( 0, 1, v, 0 );
    const capacitor = new DynamicCircuit.DynamicCapacitor(
      new DynamicCircuit.Capacitor( 2, 0, c ),
      new DynamicCircuit.DynamicElementState( 0.0, v / r )
    );
    let dynamicCircuit = new DynamicCircuit( [], [ resistor ], [], [ battery ], [ capacitor ], [] );

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

  //this is for comparison with TestTheveninCapacitorRC
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

} );