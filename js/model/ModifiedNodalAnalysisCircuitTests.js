// Copyright 2017, University of Colorado Boulder

/**
 * ModifiedNodalAnalysisCircuit tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuit' );
  var ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  var ModifiedNodalAnalysisSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisSolution' );

  QUnit.module( 'ModifiedNodalAnalysisCircuit' );

  var approxEquals = function( a, b ) {
    return Math.abs( a - b ) < 1E-6;
  };

  QUnit.test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit',
    function( assert ) {
      var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
      var resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
      var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
      var voltageMap = { 0: 0.0, 1: 4.0 };

      var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [ battery ] );
      var solution = circuit.solve();
      assert.equal( true, solution.approxEquals( desiredSolution, assert ), 'solutions instances should match' );

      var currentThroughResistor = solution.getCurrentForResistor( resistor );

      // should be flowing forward through resistor
      assert.equal( approxEquals( currentThroughResistor, 1.0 ), true, 'current should be 1 amp through the resistor' );
    } );

  QUnit.test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit_ii',
    function( assert ) {
      var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
      var resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 2.0 );
      var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
      var desiredSolution = new ModifiedNodalAnalysisSolution( {
        0: 0,
        1: 4
      }, [ _.extend( {}, battery, { currentSolution: 2.0 } ) ] );
      var solution = circuit.solve();
      assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solution should match' );
    } );


  QUnit.test( 'test_should_be_able_to_obtain_current_for_a_resistor', function( assert ) {
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    var resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 2.0 );
    var solution = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] ).solve();
    var desiredSolution = new ModifiedNodalAnalysisSolution( {
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
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    var resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
    var resistor2 = new ModifiedNodalAnalysisCircuitElement( 2, 3, null, 100 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor1, resistor2 ], [] );
    var desiredSolution = new ModifiedNodalAnalysisSolution( {
      0: 0,
      1: 4,
      2: 0,
      3: 0
    }, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_current_source_should_provide_current', function( assert ) {
    var currentSource = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 10 );
    var resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4 );
    var circuit = new ModifiedNodalAnalysisCircuit( [], [ resistor ], [ currentSource ] );
    var voltageMap = {
      0: 0,

      // This is negative since traversing across the resistor should yield a negative voltage, see
      // http://en.wikipedia.org/wiki/Current_source
      1: -40.0
    };
    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_current_should_be_reversed_when_voltage_is_reversed', function( assert ) {
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, -4 );
    var resistor = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 2 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
    var voltageMap = {
      0: 0,
      1: -4
    };

    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [ _.extend(
      {},
      battery,
      {
        currentSolution: -2
      } ) ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_two_batteries_in_series_should_have_voltage_added', function( assert ) {
    var battery1 = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, -4 );
    var battery2 = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, -4 );
    var resistor1 = new ModifiedNodalAnalysisCircuitElement( 2, 0, null, 2.0 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery1, battery2 ], [ resistor1 ], [] );

    var voltageMap = {
      0: 0,
      1: -4,
      2: -8
    };
    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery1, { currentSolution: -4 } ),
      _.extend( {}, battery2, { currentSolution: -4 } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_two_resistors_in_series_should_have_resistance_added', function( assert ) {
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 5.0 );
    var resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, 10.0 );
    var resistor2 = new ModifiedNodalAnalysisCircuitElement( 2, 0, null, 10.0 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor1,
      resistor2
    ], [] );
    var voltageMap = {
      0: 0,
      1: 5,
      2: 2.5
    };
    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 5 / 20.0 } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_A_resistor_with_one_node_unconnected_shouldnt_cause_problems', function( assert ) {
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    var resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
    var resistor2 = new ModifiedNodalAnalysisCircuitElement( 0, 2, null, 100.0 );
    var circuit = new ModifiedNodalAnalysisCircuit(
      [ battery ],
      [ resistor1, resistor2 ], []
    );
    var voltageMap = {
      0: 0,
      1: 4,
      2: 0
    };
    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_an_unconnected_resistor_shouldnt_cause_problems', function( assert ) {
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 4.0 );
    var resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, 4.0 );
    var resistor2 = new ModifiedNodalAnalysisCircuitElement( 2, 3, null, 100.0 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor1,
      resistor2
    ], [] );
    var voltageMap = {
      0: 0,
      1: 4, 2: 0, 3: 0
    };

    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_should_handle_resistors_with_no_resistance', function( assert ) {
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, 5 );
    var resistor = new ModifiedNodalAnalysisCircuitElement( 2, 0, null, 0 );
    var resistor0 = new ModifiedNodalAnalysisCircuitElement( 1, 2, null, 10 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor0,
      resistor
    ], [] );
    var voltageMap = {
      0: 0,
      1: 5,
      2: 0
    };
    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 5.0 / 10.0 } ),
      _.extend( {}, resistor, { currentSolution: 5.0 / 10.0 } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test_resistors_in_parallel_should_have_harmonic_mean_of_resistance', function( assert ) {
    var V = 9.0;
    var R1 = 5.0;
    var R2 = 5.0;
    var Req = 1 / ( 1 / R1 + 1 / R2 );
    var battery = new ModifiedNodalAnalysisCircuitElement( 0, 1, null, V );
    var resistor1 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, R1 );
    var resistor2 = new ModifiedNodalAnalysisCircuitElement( 1, 0, null, R2 );
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      resistor1,
      resistor2
    ], [] );
    var voltageMap = { 0: 0, 1: V };

    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: V / Req } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );
} );