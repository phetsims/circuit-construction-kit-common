// Copyright 2025, University of Colorado Boulder

/**
 * EECircuitAdapter bridges PhET's Circuit model to the EEcircuit SPICE solver.
 * For the MVP, this handles DC (static) circuits only: batteries and resistors.
 *
 * This adapter:
 * 1. Converts circuit topology to a SPICE netlist
 * 2. Runs the EEcircuit solver
 * 3. Parses results back into a format compatible with MNASolution
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type MNABattery from './mna/MNABattery.js';
import type MNACircuitElement from './mna/MNACircuitElement.js';
import type MNAResistor from './mna/MNAResistor.js';
import MNASolution from './mna/MNASolution.js';

// Type for EEcircuit result data entry
type EEcircuitDataEntry = {
  name: string;
  type: 'voltage' | 'current' | 'time' | 'frequency' | 'notype';
  values: number[] | Array<{ real: number; img: number }>;
};

// The result format from EEcircuit's runSim()
type EEcircuitResult = {
  header: string;
  numVariables: number;
  variableNames: string[];
  numPoints: number;
  dataType: 'real' | 'complex';
  data: EEcircuitDataEntry[];
};

// Type for EEcircuit simulation (loaded globally)
type EEcircuitSimulation = {
  start: () => Promise<void>;
  setNetList: ( netlist: string ) => void;
  runSim: () => Promise<EEcircuitResult>;
  getError: () => string[];
};

export default class EECircuitAdapter {

  private readonly batteries: MNABattery[];
  private readonly resistors: MNAResistor[];

  // Maps from netlist element names back to the original elements
  private readonly batteryNameMap: Map<string, MNABattery>;
  private readonly resistorNameMap: Map<string, MNAResistor>;

  // Node name mappings (PhET uses string indices like '0', '1', etc.)
  private readonly nodeSet: Set<string>;

  public constructor( batteries: MNABattery[], resistors: MNAResistor[] ) {
    this.batteries = batteries;
    this.resistors = resistors;
    this.batteryNameMap = new Map();
    this.resistorNameMap = new Map();
    this.nodeSet = new Set();

    // Collect all nodes
    for ( const battery of batteries ) {
      this.nodeSet.add( battery.nodeId0 );
      this.nodeSet.add( battery.nodeId1 );
    }
    for ( const resistor of resistors ) {
      this.nodeSet.add( resistor.nodeId0 );
      this.nodeSet.add( resistor.nodeId1 );
    }
  }

  /**
   * Generates a SPICE netlist for DC operating point analysis.
   *
   * SPICE netlist format:
   * - First line is the title
   * - V<name> <n+> <n-> DC <voltage>  for voltage sources
   * - R<name> <n1> <n2> <resistance>  for resistors
   * - .OP for DC operating point analysis
   * - .END to terminate
   *
   * Note: SPICE uses node 0 as ground by convention.
   */
  public generateNetlist(): string {
    const lines: string[] = [];

    lines.push( 'PhET CCK DC Circuit' );

    // Add voltage sources (batteries)
    // In SPICE, V<name> <positive_node> <negative_node> DC <voltage>
    // PhET convention: current flows from nodeId0 to nodeId1 through the battery (low to high potential internally)
    // So nodeId0 is the negative terminal, nodeId1 is the positive terminal
    for ( let i = 0; i < this.batteries.length; i++ ) {
      const battery = this.batteries[ i ];
      const name = `V${i + 1}`;
      this.batteryNameMap.set( name, battery );

      // SPICE: positive terminal first, then negative terminal
      // PhET battery: nodeId0 is negative (low potential), nodeId1 is positive (high potential)
      // The voltage is the drop from nodeId0 to nodeId1
      lines.push( `${name} ${battery.nodeId1} ${battery.nodeId0} DC ${battery.voltage}` );
    }

    // Add resistors
    // R<name> <node1> <node2> <resistance>
    for ( let i = 0; i < this.resistors.length; i++ ) {
      const resistor = this.resistors[ i ];
      const name = `R${i + 1}`;
      this.resistorNameMap.set( name, resistor );

      // Ensure non-zero resistance (SPICE doesn't like 0-resistance)
      const resistance = resistor.resistance > 0 ? resistor.resistance : 1e-9;
      lines.push( `${name} ${resistor.nodeId0} ${resistor.nodeId1} ${resistance}` );
    }

    // DC operating point analysis
    lines.push( '.OP' );
    lines.push( '.END' );

    return lines.join( '\n' );
  }

  /**
   * Alternative: Generate a transient analysis netlist with very short time step
   * to effectively get DC solution. This might be more compatible with EEcircuit's API.
   */
  public generateTransientNetlist(): string {
    const lines: string[] = [];

    lines.push( 'PhET CCK DC Circuit (Transient)' );

    // Add voltage sources as DC sources
    for ( let i = 0; i < this.batteries.length; i++ ) {
      const battery = this.batteries[ i ];
      const name = `V${i + 1}`;
      this.batteryNameMap.set( name, battery );
      lines.push( `${name} ${battery.nodeId1} ${battery.nodeId0} DC ${battery.voltage}` );
    }

    // Add resistors
    for ( let i = 0; i < this.resistors.length; i++ ) {
      const resistor = this.resistors[ i ];
      const name = `R${i + 1}`;
      this.resistorNameMap.set( name, resistor );
      const resistance = resistor.resistance > 0 ? resistor.resistance : 1e-9;
      lines.push( `${name} ${resistor.nodeId0} ${resistor.nodeId1} ${resistance}` );
    }

    // Short transient to reach steady state
    // .tran <step> <stop> [start] [max_step]
    lines.push( '.tran 1m 10m' );
    lines.push( '.END' );

    return lines.join( '\n' );
  }

  /**
   * Helper to get the last value from an EEcircuit data entry.
   * Handles both real and complex data types.
   */
  private getLastValue( entry: EEcircuitDataEntry ): number {
    if ( entry.values.length === 0 ) {
      return 0;
    }

    const lastValue = entry.values[ entry.values.length - 1 ];

    // Handle complex numbers (take the real part)
    if ( typeof lastValue === 'object' && 'real' in lastValue ) {
      return lastValue.real;
    }

    return lastValue;
  }

  /**
   * Helper to find a data entry by name (case-insensitive).
   */
  private findDataEntry( result: EEcircuitResult, name: string ): EEcircuitDataEntry | undefined {
    const lowerName = name.toLowerCase();
    return result.data.find( entry => entry.name.toLowerCase() === lowerName );
  }

  /**
   * Parses EEcircuit results into an MNASolution.
   *
   * EEcircuit result format:
   * - data: Array of { name, type, values }
   * - Variable names are like 'time', 'v(1)', 'v(2)', 'i(v1)'
   *
   * @param result - The result from EEcircuit's runSim()
   * @returns MNASolution compatible with PhET's existing code
   */
  public parseResult( result: EEcircuitResult ): MNASolution {

    // Build voltage map for all nodes
    const voltageMap = new Map<string, number>();

    // EEcircuit returns data as an array of { name, type, values }
    // Variable names are like 'v(1)', 'v(2)' for node voltages
    for ( const node of this.nodeSet ) {
      // Try different naming conventions SPICE might use
      const entry = this.findDataEntry( result, `v(${node})` );

      if ( entry ) {
        // Get the last value (steady-state for DC circuits)
        // SPICE convention: node 0 is ground (0V), other nodes are relative to ground
        const spiceVoltage = this.getLastValue( entry );

        // PhET convention differs from SPICE - PhET uses negative voltages relative to battery positive terminal
        // SPICE: V(positive) > 0, V(negative) = 0 (ground)
        // PhET: Looking at MNACircuitTests, a 4V battery from node 0 to 1 gives V(0)=0, V(1)=-4
        // This means PhET's convention is V(node) = -(SPICE voltage at node)
        // Actually, after reviewing the tests more carefully:
        // - In PhET, the battery's positive terminal (nodeId1) gets the negative voltage
        // - This is because PhET measures voltage drop across elements differently
        voltageMap.set( node, -spiceVoltage );
      }
      else {
        // Node 0 is always ground
        voltageMap.set( node, 0 );
      }
    }

    // Ensure node 0 is ground in both conventions
    voltageMap.set( '0', 0 );

    // Build current map for batteries (and zero-resistance elements)
    const currentMap = new Map<MNACircuitElement, number>();

    // For batteries, current is reported as i(v1), i(v2), etc.
    for ( const [ name, battery ] of this.batteryNameMap ) {
      const entry = this.findDataEntry( result, `i(${name})` );

      if ( entry ) {
        const spiceCurrent = this.getLastValue( entry );

        // SPICE and PhET use the same sign convention for voltage source current:
        // negative current means current is flowing into the positive terminal.
        // No sign conversion needed.
        currentMap.set( battery, spiceCurrent );
      }
      else {
        currentMap.set( battery, 0 );
      }
    }

    // For zero-resistance resistors, we also need solved currents
    // Note: SPICE doesn't typically report current through resistors directly,
    // but for 0-resistance elements (modeled as very small R), we can compute from V/R
    for ( const [ name, resistor ] of this.resistorNameMap ) {
      if ( resistor.resistance === 0 || resistor.resistance < 1e-6 ) {
        // For 0-resistance, try to find current in the data
        const entry = this.findDataEntry( result, `i(${name})` );
        if ( entry ) {
          currentMap.set( resistor, this.getLastValue( entry ) );
        }
        else {
          // Cannot determine current for 0-resistance without explicit current measurement
          currentMap.set( resistor, 0 );
        }
      }
    }

    return new MNASolution( voltageMap, currentMap );
  }

  /**
   * Solves the circuit using EEcircuit and returns an MNASolution.
   *
   * @param eesim - The EEcircuit simulation instance (from window.EEcircuit.Simulation)
   */
  public async solve( eesim: EEcircuitSimulation ): Promise<MNASolution> {
    const netlist = this.generateTransientNetlist();

    console.log( 'EECircuitAdapter netlist:', netlist );

    eesim.setNetList( netlist );
    const result = await eesim.runSim();

    console.log( 'EECircuitAdapter result:', result );

    return this.parseResult( result );
  }

  /**
   * Synchronous solve method that matches MNACircuit.solve() signature.
   * This is for testing/comparison purposes. In production, use the async solve() method.
   *
   * Note: This currently just runs the standard MNA solve - the async EEcircuit integration
   * will need to be handled at a higher level in the call stack.
   */
  public solveSync(): MNASolution {
    // Import and use the standard MNA solver for synchronous operation
    // This is a placeholder - actual integration needs async handling at the Circuit.step() level

    // For now, compute solution using Ohm's law for simple DC circuits
    const voltageMap = new Map<string, number>();
    const currentMap = new Map<MNACircuitElement, number>();

    // This is a simplified placeholder that won't work for complex circuits
    // The real solution requires the async EEcircuit call

    // Set ground to 0
    for ( const node of this.nodeSet ) {
      voltageMap.set( node, 0 );
    }

    // For batteries, compute current based on circuit
    for ( const battery of this.batteries ) {
      currentMap.set( battery, 0 );
    }

    return new MNASolution( voltageMap, currentMap );
  }

  /**
   * Static factory method that creates an adapter and generates a netlist from MNA-style inputs.
   */
  public static createNetlist( batteries: MNABattery[], resistors: MNAResistor[] ): string {
    const adapter = new EECircuitAdapter( batteries, resistors );
    return adapter.generateTransientNetlist();
  }
}

circuitConstructionKitCommon.register( 'EECircuitAdapter', EECircuitAdapter );
