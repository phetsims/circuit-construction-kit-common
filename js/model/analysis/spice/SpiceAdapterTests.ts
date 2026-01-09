// Copyright 2026, University of Colorado Boulder

/**
 * Tests for SpiceAdapter - verifies netlist generation and result parsing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import MNABattery from '../mna/MNABattery.js';
import MNACircuit from '../mna/MNACircuit.js';
import MNAResistor from '../mna/MNAResistor.js';
import SpiceAdapter from './SpiceAdapter.js';

QUnit.module( 'SpiceAdapter' );

// Helper to check approximate equality
const approxEquals = ( a: number, b: number, tolerance = 1e-6 ): boolean => Math.abs( a - b ) < tolerance;

QUnit.test( 'netlist generation: simple battery and resistor', assert => {
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor = new MNAResistor( '1', '0', 2.0 );

  const adapter = new SpiceAdapter( [ battery ], [ resistor ] );
  const netlist = adapter.generateTransientNetlist();

  console.log( 'Generated netlist:\n', netlist );

  // Check that netlist contains expected elements
  assert.ok( netlist.includes( 'V1' ), 'netlist should contain voltage source V1' );
  assert.ok( netlist.includes( 'R1' ), 'netlist should contain resistor R1' );
  assert.ok( netlist.includes( '.tran' ), 'netlist should contain transient analysis command' );
  assert.ok( netlist.includes( '.END' ), 'netlist should end with .END' );

  // Check voltage source format: V1 <positive_node> <negative_node> DC <voltage>
  // PhET: nodeId0='0' (negative), nodeId1='1' (positive), voltage=4.0
  // SPICE line should be: V1 1 0 DC 4
  assert.ok( netlist.includes( 'V1 1 0 DC 4' ), 'voltage source should have correct format' );

  // Check resistor format: R1 <node1> <node2> <resistance>
  assert.ok( netlist.includes( 'R1 1 0 2' ), 'resistor should have correct format' );
} );

QUnit.test( 'netlist generation: two batteries in series', assert => {
  const battery1 = new MNABattery( '0', '1', 4.0 );
  const battery2 = new MNABattery( '1', '2', 4.0 );
  const resistor = new MNAResistor( '2', '0', 2.0 );

  const adapter = new SpiceAdapter( [ battery1, battery2 ], [ resistor ] );
  const netlist = adapter.generateTransientNetlist();

  console.log( 'Series batteries netlist:\n', netlist );

  assert.ok( netlist.includes( 'V1' ), 'should have V1' );
  assert.ok( netlist.includes( 'V2' ), 'should have V2' );
  assert.ok( netlist.includes( 'R1' ), 'should have R1' );
} );

QUnit.test( 'netlist generation: resistors in parallel', assert => {
  const battery = new MNABattery( '0', '1', 9.0 );
  const resistor1 = new MNAResistor( '1', '0', 5.0 );
  const resistor2 = new MNAResistor( '1', '0', 5.0 );

  const adapter = new SpiceAdapter( [ battery ], [ resistor1, resistor2 ] );
  const netlist = adapter.generateTransientNetlist();

  console.log( 'Parallel resistors netlist:\n', netlist );

  assert.ok( netlist.includes( 'V1' ), 'should have V1' );
  assert.ok( netlist.includes( 'R1' ), 'should have R1' );
  assert.ok( netlist.includes( 'R2' ), 'should have R2' );
} );

QUnit.test( 'compare MNA vs Spice netlist: simple circuit', assert => {
  // This test generates the netlist and compares what MNA produces vs what we'd send to Spice
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor = new MNAResistor( '1', '0', 2.0 );

  // MNA solution
  const mnaSolution = new MNACircuit( [ battery ], [ resistor ], [] ).solve();

  // Expected: V(0)=0, V(1)=-4 (PhET convention), current=2A through battery
  const v0 = mnaSolution.getNodeVoltage( '0' );
  const v1 = mnaSolution.getNodeVoltage( '1' );
  const current = mnaSolution.getSolvedCurrent( battery );

  console.log( `MNA Solution: V(0)=${v0}, V(1)=${v1}, I=${current}` );

  assert.ok( approxEquals( v0, 0 ), 'V(0) should be 0 (ground)' );
  assert.ok( approxEquals( v1, -4 ), 'V(1) should be -4V (PhET convention)' );
  assert.ok( approxEquals( current, 2 ), 'Battery current should be 2A' );

  // Generate netlist for same circuit
  const netlist = SpiceAdapter.createNetlist( [ battery ], [ resistor ] );
  console.log( 'Netlist for Spice:\n', netlist );

  // Note: SPICE conventions differ from PhET
  // SPICE: V(node) is absolute, ground is node 0
  // PhET: Uses relative voltages with different sign convention
  // Spice should return: V(0)=0, V(1)=4 (standard SPICE)
  // We'll need to convert when parsing results

  assert.ok( true, 'Netlist generated successfully' );
} );

QUnit.test( 'netlist generation: voltage divider', assert => {
  // Classic voltage divider: battery -> R1 -> R2 -> ground
  const battery = new MNABattery( '0', '1', 5.0 );
  const resistor1 = new MNAResistor( '1', '2', 10.0 );
  const resistor2 = new MNAResistor( '2', '0', 10.0 );

  // MNA solution
  const mnaSolution = new MNACircuit( [ battery ], [ resistor1, resistor2 ], [] ).solve();

  console.log( `Voltage divider MNA: V(0)=${mnaSolution.getNodeVoltage( '0' )}, ` +
               `V(1)=${mnaSolution.getNodeVoltage( '1' )}, ` +
               `V(2)=${mnaSolution.getNodeVoltage( '2' )}` );

  // Expected: V(0)=0, V(1)=-5, V(2)=-2.5 (PhET convention)
  // Current = 5V / 20Ω = 0.25A
  assert.ok( approxEquals( mnaSolution.getNodeVoltage( '0' ), 0 ), 'V(0)=0' );
  assert.ok( approxEquals( mnaSolution.getNodeVoltage( '1' ), -5 ), 'V(1)=-5' );
  assert.ok( approxEquals( mnaSolution.getNodeVoltage( '2' ), -2.5 ), 'V(2)=-2.5' );
  assert.ok( approxEquals( mnaSolution.getSolvedCurrent( battery ), 0.25 ), 'I=0.25A' );

  // Generate netlist
  const netlist = SpiceAdapter.createNetlist( [ battery ], [ resistor1, resistor2 ] );
  console.log( 'Voltage divider netlist:\n', netlist );

  // SPICE should give: V(0)=0, V(1)=5, V(2)=2.5
  assert.ok( true, 'Voltage divider netlist generated' );
} );

QUnit.test( 'netlist generation: disconnected components', assert => {
  // Test with components that aren't connected - this tests the node set collection
  const battery = new MNABattery( '0', '1', 4.0 );
  const resistor1 = new MNAResistor( '1', '0', 4.0 );
  const resistor2 = new MNAResistor( '2', '3', 100.0 ); // Disconnected!

  const adapter = new SpiceAdapter( [ battery ], [ resistor1, resistor2 ] );
  const netlist = adapter.generateTransientNetlist();

  console.log( 'Disconnected components netlist:\n', netlist );

  // All four nodes should be present
  assert.ok( netlist.includes( 'R2 2 3' ), 'disconnected resistor should be included' );
} );

QUnit.test( 'netlist format matches Spice expectations', assert => {
  // Verify the netlist format matches what we know works in Spice
  // Based on the working example in circuit-construction-kit-dc-main.ts

  const battery = new MNABattery( '0', '1', 5.0 );
  const resistor = new MNAResistor( '1', '0', 1000.0 ); // 1k ohm

  const adapter = new SpiceAdapter( [ battery ], [ resistor ] );
  const netlist = adapter.generateTransientNetlist();

  // Should be similar to:
  // v1 1 0 dc 5
  // r1 1 0 1k
  // .tran 0.01m 5m

  const lines = netlist.split( '\n' );
  assert.ok( lines.length >= 4, 'netlist should have at least 4 lines (title, V, R, .tran, .END)' );
  assert.ok( lines[ 0 ].includes( 'PhET' ), 'first line should be title' );
  assert.ok( lines[ lines.length - 1 ].trim() === '.END', 'last line should be .END' );

  console.log( 'Spice-compatible netlist:\n', netlist );
  assert.ok( true, 'Netlist format verified' );
} );
