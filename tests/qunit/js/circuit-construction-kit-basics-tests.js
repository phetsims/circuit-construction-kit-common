// Copyright 2002-2015, University of Colorado Boulder

(function() {
  'use strict';

  var OOCircuit = phet.circuitConstructionKitBasics.OOCircuit;
  var LinearCircuitSolution = phet.circuitConstructionKitBasics.LinearCircuitSolution;

  module( 'Circuit Construction Kit: Basics' );

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
})();