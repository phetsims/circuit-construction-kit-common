// Copyright 2002-2015, University of Colorado Boulder

(function() {
  'use strict';

  var OOCircuit = phet.circuitConstructionKitBasics.OOCircuit;
  var LinearCircuitSolution = phet.circuitConstructionKitBasics.LinearCircuitSolution;

  module( 'Circuit Construction Kit: Basics' );

  test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit', function() {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor = { node0: 1, node1: 0, resistance: 4.0 };
    var circuit = new OOCircuit( [ battery ], [ resistor ], [] );
    var voltageMap = { 0: 0.0, 1: 4.0 };

    battery.desiredCurrent = 1.0;
    var desiredSolution = new LinearCircuitSolution( voltageMap, [ battery ] );
    var solution = circuit.solve( circuit );
    console.log( 'solution = ', solution );
    console.log( 'desiredSolution = ', desiredSolution );
    equal( true, solution.approxEquals( desiredSolution ) );

    var currentThroughResistor = solution.getCurrent( resistor );
    equal( true, currentThroughResistor === 1.0 ); // should be flowing forward through resistor
  } );
})();