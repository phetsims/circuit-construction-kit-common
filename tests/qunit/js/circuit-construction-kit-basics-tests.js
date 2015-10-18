// Copyright 2002-2015, University of Colorado Boulder

(function() {
  'use strict';

  var OOCircuit = phet.circuitConstructionKitBasics.OOCircuit;
  var LinearCircuitSolution = phet.circuitConstructionKitBasics.LinearCircuitSolution;

  module( 'Circuit Construction Kit: Basics' );

  var FUDGE = 0.000001;

  var approxEquals = function( a, b ) {
    return Math.abs( a - b ) < 1E-6;
  };

  test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor = { node0: 1, node1: 0, resistance: 4.0 };
    var circuit = new OOCircuit( [ battery ], [ resistor ], [] );
    var voltageMap = { 0: 0.0, 1: 4.0 };

    var desiredSolution = new LinearCircuitSolution( voltageMap, [ battery ] );
    var solution = circuit.solve();
    console.log( 'solution = ', solution );
    console.log( 'desiredSolution = ', desiredSolution );
    equal( true, solution.approxEquals( desiredSolution, equal ), 'solutions instances should match' );

    var currentThroughResistor = solution.getCurrent( resistor );
    equal( approxEquals( currentThroughResistor, 1.0 ), true, 'current should be 1 amp through the resistor' ); // should be flowing forward through resistor
  } );

  test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit_ii', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor = { node0: 1, node1: 0, resistance: 2.0 };
    var circuit = new OOCircuit( [ battery ], [ resistor ], [] );
    var desiredSolution = new LinearCircuitSolution( {
      0: 0,
      1: 4
    }, [ _.extend( {}, battery, { currentSolution: 2.0 } ) ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solution should match' );
  } );


  test( 'test_should_be_able_to_obtain_current_for_a_resistor', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor = { node0: 1, node1: 0, resistance: 2.0 };
    var solution = new OOCircuit( [ battery ], [ resistor ], [] ).solve();
    var desiredSolution = new LinearCircuitSolution( {
      0: 0,
      1: 4
    }, [ _.extend( {}, battery, { currentSolution: 2 } ) ] );
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solution should match' );

    // same magnitude as battery: positive because current flows from node 1 to 0
    equal( approxEquals( solution.getCurrent( resistor ), 2 ), true, 'current through resistor should be 2.0 Amps' );
  } );

  test( 'test_an_unconnected_resistor_shouldnt_cause_problems', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor1 = { node0: 1, node1: 0, resistance: 4.0 };
    var resistor2 = { node0: 2, node1: 3, resistance: 100 };
    var circuit = new OOCircuit( [ battery ], [ resistor1, resistor2 ], [] );
    var desiredSolution = new LinearCircuitSolution( {
      0: 0,
      1: 4,
      2: 0,
      3: 0
    }, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_current_source_should_provide_current', function() {
    var currentSource = { node0: 0, node1: 1, current: 10 };
    var resistor = { node0: 1, node1: 0, resistance: 4 };
    var circuit = new OOCircuit( [], [ resistor ], [ currentSource ] );
    var voltageMap = {
      0: 0,
      1: -39.999996 // This is negative since traversing across the resistor should yield a negative voltage, see http://en.wikipedia.org/wiki/Current_source
    };
    var desiredSolution = new LinearCircuitSolution( voltageMap, [] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_current_should_be_reversed_when_voltage_is_reversed', function() {
    var battery = { node0: 0, node1: 1, voltage: -4 };
    var resistor = { node0: 1, node1: 0, resistance: 2 };
    var circuit = new OOCircuit( [ battery ], [ resistor ], [] );
    var voltageMap = {
      0: 0,
      1: -4
    };

    var desiredSolution = new LinearCircuitSolution( voltageMap, [ _.extend( {}, battery, { currentSolution: -2 } ) ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_two_batteries_in_series_should_have_voltage_added', function() {
    var battery1 = { node0: 0, node1: 1, voltage: -4 };
    var battery2 = { node0: 1, node1: 2, voltage: -4 };
    var circuit = new OOCircuit( [ battery1, battery2 ], [ { node0: 2, node1: 0, resistance: 2.0 } ], [] );

    var voltageMap = {

      // TODO: What to do about these numerical issues that are larger than 1E6
      0: 0 + FUDGE,
      1: -4 + FUDGE,
      2: -8 + FUDGE
    };
    var desiredSolution = new LinearCircuitSolution( voltageMap, [
      _.extend( {}, battery1, { currentSolution: -4 } ),
      _.extend( {}, battery2, { currentSolution: -4 } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_two_resistors_in_series_should_have_resistance_added', function() {
    var battery = { node0: 0, node1: 1, voltage: 5.0 };
    var circuit = new OOCircuit( [ battery ], [
      { node0: 1, node1: 2, resistance: 10.0 },
      { node0: 2, node1: 0, resistance: 10.0 }
    ], [] );
    var voltageMap = {
      0: 0,
      1: 5,
      2: 2.5 + FUDGE
    };
    var desiredSolution = new LinearCircuitSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 5 / 20.0 } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_A_resistor_with_one_node_unconnected_shouldnt_cause_problems', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var circuit = new OOCircuit(
      [ battery ],
      [
        { node0: 1, node1: 0, resistance: 4.0 },
        { node0: 0, node1: 2, resistance: 100.0 } ], []
    );
    var voltageMap = {
      0: 0,
      1: 4,
      2: 0 - FUDGE
    };
    var desiredSolution = new LinearCircuitSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_an_unconnected_resistor_shouldnt_cause_problems', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var circuit = new OOCircuit( [ battery ], [
      { node0: 1, node1: 0, resistance: 4.0 },
      { node0: 2, node1: 3, resistance: 100.0 }
    ], [] );
    var voltageMap = {
      0: 0,
      1: 4, 2: 0, 3: 0
    };

    var desiredSolution = new LinearCircuitSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 1.0 } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_should_handle_resistors_with_no_resistance', function() {
    var battery = { node0: 0, node1: 1, voltage: 5 };
    var resistor = { node0: 2, node1: 0, resistance: 0 };
    var circuit = new OOCircuit( [ battery ], [
      { node0: 1, node1: 2, resistance: 10 },
      resistor
    ], [] );
    var voltageMap = {
      0: 0,
      1: 5,
      2: 0
    };
    var desiredSolution = new LinearCircuitSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: 5.0 / 10.0 } ),
      _.extend( {}, resistor, { currentSolution: 5.0 / 10.0 } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );

  test( 'test_resistors_in_parallel_should_have_harmonic_mean_of_resistance', function() {
    var V = 9.0;
    var R1 = 5.0;
    var R2 = 5.0;
    var Req = 1 / ( 1 / R1 + 1 / R2 );
    var battery = { node0: 0, node1: 1, voltage: V };
    var circuit = new OOCircuit( [ battery ], [
      { node0: 1, node1: 0, resistance: R1 },
      { node0: 1, node1: 0, resistance: R2 }
    ], [] );
    var voltageMap = { 0: 0, 1: V - FUDGE };

    var desiredSolution = new LinearCircuitSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: V / Req } )
    ] );
    var solution = circuit.solve();
    equal( solution.approxEquals( desiredSolution, equal ), true, 'solutions should match' );
  } );
})();