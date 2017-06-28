// Copyright 2002-2015, University of Colorado Boulder

(function() {
  'use strict';

  var ModifiedNodalAnalysisCircuit = phet.circuitConstructionKitCommon.ModifiedNodalAnalysisCircuit;
  var ModifiedNodalAnalysisSolution = phet.circuitConstructionKitCommon.ModifiedNodalAnalysisSolution;
  var ResistorColors = phet.circuitConstructionKitCommon.ResistorColors;

  var approxEquals = function( a, b ) {
    return Math.abs( a - b ) < 1E-6;
  };

  QUnit.test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit',
    function( assert ) {
      var battery = { node0: 0, node1: 1, voltage: 4.0 };
      var resistor = { node0: 1, node1: 0, resistance: 4.0 };
      var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
      var voltageMap = { 0: 0.0, 1: 4.0 };

      var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [ battery ] );
      var solution = circuit.solve();
      console.log( 'solution = ', solution );
      console.log( 'desiredSolution = ', desiredSolution );
      assert.equal( true, solution.approxEquals( desiredSolution, assert ), 'solutions instances should match' );

      var currentThroughResistor = solution.getCurrent( resistor );

      // should be flowing forward through resistor
      assert.equal( approxEquals( currentThroughResistor, 1.0 ), true, 'current should be 1 amp through the resistor' );
    } );

  QUnit.test( 'test_battery_resistor_circuit_should_have_correct_voltages_and_currents_for_a_simple_circuit_ii',
    function( assert ) {
      var battery = { node0: 0, node1: 1, voltage: 4.0 };
      var resistor = { node0: 1, node1: 0, resistance: 2.0 };
      var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] );
      var desiredSolution = new ModifiedNodalAnalysisSolution( {
        0: 0,
        1: 4
      }, [ _.extend( {}, battery, { currentSolution: 2.0 } ) ] );
      var solution = circuit.solve();
      assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solution should match' );
    } );


  QUnit.test( 'test_should_be_able_to_obtain_current_for_a_resistor', function( assert ) {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor = { node0: 1, node1: 0, resistance: 2.0 };
    var solution = new ModifiedNodalAnalysisCircuit( [ battery ], [ resistor ], [] ).solve();
    var desiredSolution = new ModifiedNodalAnalysisSolution( {
      0: 0,
      1: 4
    }, [ _.extend( {}, battery, { currentSolution: 2 } ) ] );
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solution should match' );

    // same magnitude as battery: positive because current flows from node 1 to 0
    assert.equal(
      approxEquals( solution.getCurrent( resistor ), 2 ), true, 'current through resistor should be 2.0 Amps'
    );
  } );

  QUnit.test( 'test_an_unconnected_resistor_shouldnt_cause_problems', function( assert ) {
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var resistor1 = { node0: 1, node1: 0, resistance: 4.0 };
    var resistor2 = { node0: 2, node1: 3, resistance: 100 };
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
    var currentSource = { node0: 0, node1: 1, current: 10 };
    var resistor = { node0: 1, node1: 0, resistance: 4 };
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
    var battery = { node0: 0, node1: 1, voltage: -4 };
    var resistor = { node0: 1, node1: 0, resistance: 2 };
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
    var battery1 = { node0: 0, node1: 1, voltage: -4 };
    var battery2 = { node0: 1, node1: 2, voltage: -4 };
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery1, battery2 ], [ {
      node0: 2,
      node1: 0,
      resistance: 2.0
    } ], [] );

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
    var battery = { node0: 0, node1: 1, voltage: 5.0 };
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      { node0: 1, node1: 2, resistance: 10.0 },
      { node0: 2, node1: 0, resistance: 10.0 }
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
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var circuit = new ModifiedNodalAnalysisCircuit(
      [ battery ],
      [
        { node0: 1, node1: 0, resistance: 4.0 },
        { node0: 0, node1: 2, resistance: 100.0 } ], []
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
    var battery = { node0: 0, node1: 1, voltage: 4.0 };
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      { node0: 1, node1: 0, resistance: 4.0 },
      { node0: 2, node1: 3, resistance: 100.0 }
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
    var battery = { node0: 0, node1: 1, voltage: 5 };
    var resistor = { node0: 2, node1: 0, resistance: 0 };
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      { node0: 1, node1: 2, resistance: 10 },
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
    var battery = { node0: 0, node1: 1, voltage: V };
    var circuit = new ModifiedNodalAnalysisCircuit( [ battery ], [
      { node0: 1, node1: 0, resistance: R1 },
      { node0: 1, node1: 0, resistance: R2 }
    ], [] );
    var voltageMap = { 0: 0, 1: V };

    var desiredSolution = new ModifiedNodalAnalysisSolution( voltageMap, [
      _.extend( {}, battery, { currentSolution: V / Req } )
    ] );
    var solution = circuit.solve();
    assert.equal( solution.approxEquals( desiredSolution, assert ), true, 'solutions should match' );
  } );

  QUnit.test( 'test resistor colors', function( assert ) {
    assert.deepEqual( ResistorColors.getColorNames( 0 ), [ 'black' ], '0 resistance should have one black band' );
    assert.deepEqual( ResistorColors.getColorNames( 1 ), [ 'brown', 'black', 'gold', 'gold' ], '1 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 10 ), [ 'brown', 'black', 'black', 'gold' ], '10 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 100 ), [ 'brown', 'black', 'brown', 'gold' ], '100 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 1000 ), [ 'brown', 'black', 'red', 'gold' ], '100 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 4700 ), [ 'yellow', 'violet', 'red', 'gold' ], '4700 ohm ' );
    assert.deepEqual( ResistorColors.getColorNames( 9900 ), [ 'white', 'white', 'red', 'gold' ], '9900 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 55 ), [ 'green', 'green', 'black', 'gold' ], '55 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 34.5 ), [ 'orange', 'green', 'black', 'gold' ], '34.5 ohm' );
    assert.deepEqual( ResistorColors.getColorNames( 99.5 ), [ 'brown', 'black', 'brown', 'gold' ], '99.5 ohm' );
    assert.deepEqual( ResistorColors.getColorNames( 10.5 ), [ 'brown', 'brown', 'black', 'gold' ], '10.5 ohm' );
    assert.deepEqual( ResistorColors.getColorNames( 7.5 ), [ 'violet', 'green', 'gold', 'gold' ], '7.5 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 20 ), [ 'red', 'black', 'black', 'gold' ], '20 ohm resistor' );
    assert.deepEqual( ResistorColors.getColorNames( 88000 ), [ 'gray', 'gray', 'orange', 'gold' ], '88000 ohm' );
  } );
})();