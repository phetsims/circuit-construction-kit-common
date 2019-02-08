// Copyright 2017, University of Colorado Boulder

/**
 * ModifiedNodalAnalysisCircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuit' );
  const ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  const ModifiedNodalAnalysisSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisSolution' );

  QUnit.module( 'ModifiedNodalAnalysisCircuit' );

  const approxEquals = function( a, b ) {
    return Math.abs( a - b ) < 1E-6;
  };

  QUnit.test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit',
    function( assert ) {
      const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
      const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
      const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
      const voltageMap = { 0: 0.0, 1: 4.0 };

      const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [ battery ] );
      const solution = circuit.solve();
      assert.equal( true, solution.approxEquals( desiredSolution, assert ), 'solutions instances should match' );

      const currentThroughResistor = solution.getCurrentForResistor( resistor );

      // should be flowing forward through resistor
      assert.equal( approxEquals( currentThroughResistor, 1.0 ), true, 'current should be 1 amp through the resistor' );
    } );

  QUnit.test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit_ii',
    function( assert ) {
      const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
      const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 2.0 );
      const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
      const desiredSolution = new ModifiedNodalAnalysisSolution( {
        0: 0,
        1: 4
      }, [ _.extend( {}, battery, { currentSolution: 2.0 } ) ] );
      const solution = circuit.solve();
      assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solution should match' );
    } );


  QUnit.test( 'test_should_be_able_to_obtain_current_for_a_resistor', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 2.0 );
    const solution = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] ).solve();
    const desiredSolution = new ModifiedNodalAnalysisSolution( {
      0: 0,
      1: 4
    }, [ _.extend( {}, battery, { currentSolution: 2 } ) ] );
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solution should match' );

    // same magnitude as battery: positive because current flows from node 1 to 0
    assert.equal(
      approxEquals( solution.getCurrentForResistor( resistor ), 2 ), true, 'current through resistor should be 2.0 Amps'
    );
  } );

  QUnit.test( 'test_an_unconnected_resistor_shouldnt_cause_problems', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    const resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
    const resistor2 = new ModifiedNodalAnalysisCircuitElement( 2, 3, null, 100 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor1, resistor2 ], [] );
    const desiredSolution = new ModifiedNodalAnalysisSolution( {
      0: 0,
      1: 4,
      2: 0,
      3: 0
    }, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_current_source_should_provide_current', function( assert ) {
    const currentSource = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 10 );
    const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4 );
    const circuit = new ModifiedNodalAnalysisCircuit( [], [ resistor ], [ currentSource ] );
    const voltageMap = {
      0: 0,

      // This is negative since traversing across the resistor should yield a negative voltage, see
      // http://en.wikipedia.org/wiki/Current_source
      1: -40.0
    };
    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_current_should_be_reversed_when_voltage_is_reversed', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, -4 );
    const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 2 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
    const voltageMap = {
      0: 0,
      1: -4
    };

    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [ _.extend(
      {},
      battery,
      {
        currentSolution: -2
      } ) ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_two_batteries_in_series_should_have_voltage_added', function( assert ) {
    const battery1 = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, -4 );
    const battery2 = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, -4 );
    const resistor1 = new ModifiedNodalAnalysisCircuitElement( 2, 0, null, 2.0 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery1, battery2 ], [ resistor1 ], [] );

    const voltageMap = {
      0: 0,
      1: -4,
      2: -8
    };
    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery1, { currentSolution: -4 } ),
      _.extend( {}, battery2, { currentSolution: -4 } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_two_resistors_in_series_should_have_resistance_added', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 5.0 );
    const resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, 10.0 );
    const resistor2 = new ModifiedNodalAnalysisCircuitElement( 2, 0, null, 10.0 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor1,
      resistor2
    ], [] );
    const voltageMap = {
      0: 0,
      1: 5,
      2: 2.5
    };
    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 5 / 20.0 } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_A_resistor_with_one_node_unconnected_shouldnt_cause_problems', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    const resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
    const resistor2 = new ModifiedNodalAnalysisCircuitElement( 0, 2, null, 100.0 );
    const circuit = new ModifiedNodalAnalysisCircuit(
      [ battery ],
      [ resistor1, resistor2 ], []
    );
    const voltageMap = {
      0: 0,
      1: 4,
      2: 0
    };
    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_an_unconnected_resistor_shouldnt_cause_problems', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    const resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
    const resistor2 = new ModifiedNodalAnalysisCircuitElement( 2, 3, null, 100.0 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor1,
      resistor2
    ], [] );
    const voltageMap = {
      0: 0,
      1: 4, 2: 0, 3: 0
    };

    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_should_handle_resistors_with_no_resistance', function( assert ) {
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 5 );
    const resistor = new ModifiedNodalAnalysisCircuitElement( 2, 0, null, 0 );
    const resistor0 = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, 10 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor0,
      resistor
    ], [] );
    const voltageMap = {
      0: 0,
      1: 5,
      2: 0
    };
    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 5.0 / 10.0 } ),
      _.extend( {}, resistor, { currentSolution: 5.0 / 10.0 } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_resistors_in_parallel_should_have_harmonic_mean_of_resistance', function( assert ) {
    const V = 9.0;
    const R1 = 5.0;
    const R2 = 5.0;
    const Req = 1 / ( 1 / R1 + 1 / R2 );
    const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, V );
    const resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, R1 );
    const resistor2 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, R2 );
    const circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor1,
      resistor2
    ], [] );
    const voltageMap = { 0: 0, 1: V };

    const desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: V / Req } )
    ] );
    const solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  // const testVRCCircuit = ( v, r, c, assert ) => {
  //   const resistor = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, r );
  //   const battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, v );
  //   const capacitor = new DynamicCircuit.DynamicCapacitor( new DynamicCircuit.Capacitor( 2, 0, c ), new DynamicCircuit.DynamicElementState( 0.0, v / r ) );
  //   let circuit = new DynamicCircuit( [], [ resistor ], [], [ battery ], [ capacitor ], [], getSolver() );
  //
  //   const dt = 1E-4;
  //   console.log( 'voltage\n' );
  //   for ( let i = 0; i < 1000; i++ ) {//takes 0.3 sec on my machine
  //     const t = i * dt;
  //
  //     const companionSolution = circuit.solveItWithSubdivisions( dt );
  //     const voltage = companionSolution.getVoltage( resistor );
  //     const desiredVoltageAtTPlusDT = -v * Math.exp( -( t + dt ) / r / c );
  //     const error = Math.abs( voltage - desiredVoltageAtTPlusDT );
  //     console.log( -voltage );
  //     assert.ok( error < 1E-6 ); //sample run indicates largest error is 1.5328E-7, is this acceptable?  See TestRCCircuit
  //     circuit = circuit.updateWithSubdivisions( dt );
  //   }
  // };
  //
  // //this is for comparison with TestTheveninCapacitorRC
  // QUnit.test( 'testVRC991Eminus2', assert => {
  //   testVRCCircuit( 9, 9, 1E-2, assert );
  // } );
  //
  // QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 5 r 10 c 1E minus2', assert => {
  //   testVRCCircuit( 5.0, 10.0, 1.0E-2, assert );
  // } );
  //
  // QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 10 r 10 c 1E minus2', assert => {
  //   testVRCCircuit( 10.0, 10.0, 1.0E-2, assert );
  // } );
  //
  // QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 3  r 7  c 1Eminus1', assert => {
  //   testVRCCircuit( 3, 7, 1E-1, assert );
  // } );
  //
  // QUnit.test( 'test RC Circuit should have voltage exponentially decay with T RC for v 3  r 7  c 100', assert => {
  //   testVRCCircuit( 3, 7, 100, assert );
  // } );
} );