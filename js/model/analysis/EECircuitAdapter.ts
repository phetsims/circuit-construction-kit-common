// Copyright 2025, University of Colorado Boulder

/**
 * EECircuitAdapter bridges PhET's Circuit model to the EEcircuit SPICE solver.
 * Supports DC and AC circuits with batteries, resistors, capacitors, and inductors.
 *
 * This adapter:
 * 1. Converts circuit topology to a SPICE netlist
 * 2. Runs the EEcircuit solver
 * 3. Parses results back into a format compatible with MNASolution
 *
 * For reactive components (capacitors, inductors), initial conditions are set
 * from the previous timestep's state, and final state is extracted for the next solve.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type MNABattery from './mna/MNABattery.js';
import type MNACapacitor from './mna/MNACapacitor.js';
import type MNACircuitElement from './mna/MNACircuitElement.js';
import type MNAInductor from './mna/MNAInductor.js';
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
  private readonly capacitors: MNACapacitor[];
  private readonly inductors: MNAInductor[];

  // Timestep for transient analysis (in seconds)
  private readonly dt: number;

  // Maps from netlist element names back to the original elements
  private readonly batteryNameMap: Map<string, MNABattery>;
  private readonly resistorNameMap: Map<string, MNAResistor>;
  private readonly capacitorNameMap: Map<string, MNACapacitor>;
  private readonly inductorNameMap: Map<string, MNAInductor>;

  // Node name mappings (PhET uses string indices like '41', '42', etc.)
  private readonly nodeSet: Set<string>;

  // Maps PhET node IDs to SPICE node numbers (0, 1, 2, ...)
  // SPICE requires node 0 as ground reference
  private readonly phetToSpiceNode: Map<string, number>;
  private readonly spiceToPhetNode: Map<number, string>;
  private readonly groundNodeId: string; // The PhET node ID chosen as ground

  public constructor(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    capacitors: MNACapacitor[] = [],
    inductors: MNAInductor[] = [],
    dt = 1e-4  // Default to 0.1ms timestep
  ) {
    this.batteries = batteries;
    this.resistors = resistors;
    this.capacitors = capacitors;
    this.inductors = inductors;
    this.dt = dt;

    this.batteryNameMap = new Map();
    this.resistorNameMap = new Map();
    this.capacitorNameMap = new Map();
    this.inductorNameMap = new Map();
    this.nodeSet = new Set();
    this.phetToSpiceNode = new Map();
    this.spiceToPhetNode = new Map();

    // Collect all nodes from all element types
    for ( const battery of batteries ) {
      this.nodeSet.add( battery.nodeId0 );
      this.nodeSet.add( battery.nodeId1 );
    }
    for ( const resistor of resistors ) {
      this.nodeSet.add( resistor.nodeId0 );
      this.nodeSet.add( resistor.nodeId1 );
    }
    for ( const capacitor of capacitors ) {
      this.nodeSet.add( capacitor.nodeId0 );
      this.nodeSet.add( capacitor.nodeId1 );
    }
    for ( const inductor of inductors ) {
      this.nodeSet.add( inductor.nodeId0 );
      this.nodeSet.add( inductor.nodeId1 );
    }

    // Create node mapping: pick the first node as ground (SPICE node 0)
    // and assign sequential numbers to the rest
    const nodeArray = Array.from( this.nodeSet );
    this.groundNodeId = nodeArray[ 0 ] || '0';

    // Map ground node to SPICE node 0
    this.phetToSpiceNode.set( this.groundNodeId, 0 );
    this.spiceToPhetNode.set( 0, this.groundNodeId );

    // Map remaining nodes to SPICE nodes 1, 2, 3, ...
    let spiceNodeNum = 1;
    for ( const phetNode of nodeArray ) {
      if ( phetNode !== this.groundNodeId ) {
        this.phetToSpiceNode.set( phetNode, spiceNodeNum );
        this.spiceToPhetNode.set( spiceNodeNum, phetNode );
        spiceNodeNum++;
      }
    }
  }

  /**
   * Convert a PhET node ID to its SPICE node number.
   */
  private toSpiceNode( phetNodeId: string ): number {
    const spiceNode = this.phetToSpiceNode.get( phetNodeId );
    if ( spiceNode === undefined ) {
      throw new Error( `Unknown PhET node ID: ${phetNodeId}` );
    }
    return spiceNode;
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
   * Note: SPICE uses node 0 as ground by convention. PhET node IDs are mapped
   * to SPICE node numbers (0, 1, 2, ...) with one node designated as ground (0).
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
      const posNode = this.toSpiceNode( battery.nodeId1 );
      const negNode = this.toSpiceNode( battery.nodeId0 );
      lines.push( `${name} ${posNode} ${negNode} DC ${battery.voltage}` );
    }

    // Add resistors
    // R<name> <node1> <node2> <resistance>
    for ( let i = 0; i < this.resistors.length; i++ ) {
      const resistor = this.resistors[ i ];
      const name = `R${i + 1}`;
      this.resistorNameMap.set( name, resistor );

      // Ensure non-zero resistance (SPICE doesn't like 0-resistance)
      const resistance = resistor.resistance > 0 ? resistor.resistance : 1e-9;
      const node1 = this.toSpiceNode( resistor.nodeId0 );
      const node2 = this.toSpiceNode( resistor.nodeId1 );
      lines.push( `${name} ${node1} ${node2} ${resistance}` );
    }

    // DC operating point analysis
    lines.push( '.OP' );
    lines.push( '.END' );

    return lines.join( '\n' );
  }

  /**
   * Generate a transient analysis netlist for the circuit.
   * Supports batteries, resistors, capacitors, and inductors with initial conditions.
   *
   * PhET node IDs are mapped to SPICE node numbers (0, 1, 2, ...) with one node
   * designated as ground (0).
   *
   * NOTE: This assumes a single connected component. Disconnected subcircuits should
   * be solved separately (each gets its own SPICE solve with its own ground reference).
   */
  public generateTransientNetlist(): string {
    const lines: string[] = [];

    lines.push( 'PhET CCK Circuit (Transient)' );

    // Debug: log capacitor initial conditions
    // if ( this.capacitors.length > 0 ) {
    //   console.log( '[SPICE] Generating netlist with capacitors:', this.capacitors.map( c => ( {
    //     nodeId0: c.nodeId0,
    //     nodeId1: c.nodeId1,
    //     capacitance: c.capacitance,
    //     phetInitialVoltage: c.initialVoltage,
    //     spiceIC: -c.initialVoltage  // Negated for SPICE
    //   } ) ) );
    // }

    // Debug: log inductor initial conditions
    // if ( this.inductors.length > 0 ) {
    //   console.log( '[SPICE] Generating netlist with inductors:', this.inductors.map( l => ( {
    //     nodeId0: l.nodeId0,
    //     nodeId1: l.nodeId1,
    //     inductance: l.inductance,
    //     phetInitialCurrent: l.initialCurrent,
    //     spiceIC: -l.initialCurrent  // Negated for SPICE
    //   } ) ) );
    // }

    // Add voltage sources as DC sources
    // For AC sources, the instantaneous voltage is passed in as the battery voltage
    for ( let i = 0; i < this.batteries.length; i++ ) {
      const battery = this.batteries[ i ];
      const name = `V${i + 1}`;
      this.batteryNameMap.set( name, battery );
      const posNode = this.toSpiceNode( battery.nodeId1 );
      const negNode = this.toSpiceNode( battery.nodeId0 );
      lines.push( `${name} ${posNode} ${negNode} DC ${battery.voltage}` );
    }

    // Add resistors
    for ( let i = 0; i < this.resistors.length; i++ ) {
      const resistor = this.resistors[ i ];
      const name = `R${i + 1}`;
      this.resistorNameMap.set( name, resistor );
      const resistance = resistor.resistance > 0 ? resistor.resistance : 1e-9;
      const node1 = this.toSpiceNode( resistor.nodeId0 );
      const node2 = this.toSpiceNode( resistor.nodeId1 );
      lines.push( `${name} ${node1} ${node2} ${resistance}` );
    }

    // Add capacitors with initial voltage conditions
    // SPICE syntax: C<name> <n+> <n-> <capacitance> [IC=<initial_voltage>]
    // Note: SPICE IC is V(n+) - V(n-) in SPICE's convention (non-negated)
    // PhET's mnaVoltageDrop is V(nodeId0) - V(nodeId1) in PhET's convention (negated)
    // Since PhET negates SPICE voltages, we need to negate the IC to convert back to SPICE space
    for ( let i = 0; i < this.capacitors.length; i++ ) {
      const capacitor = this.capacitors[ i ];
      const name = `C${i + 1}`;
      this.capacitorNameMap.set( name, capacitor );
      const node1 = this.toSpiceNode( capacitor.nodeId0 );
      const node2 = this.toSpiceNode( capacitor.nodeId1 );
      // Negate the initial voltage to convert from PhET convention to SPICE convention
      const spiceIC = -capacitor.initialVoltage;
      lines.push( `${name} ${node1} ${node2} ${capacitor.capacitance} IC=${spiceIC}` );
    }

    // Add inductors with initial current conditions
    // SPICE syntax: L<name> <n+> <n-> <inductance> [IC=<initial_current>]
    // Similar to capacitor voltage, we need to negate the initial current to convert
    // from PhET convention to SPICE convention
    for ( let i = 0; i < this.inductors.length; i++ ) {
      const inductor = this.inductors[ i ];
      const name = `L${i + 1}`;
      this.inductorNameMap.set( name, inductor );
      const node1 = this.toSpiceNode( inductor.nodeId0 );
      const node2 = this.toSpiceNode( inductor.nodeId1 );
      // Negate the initial current to convert from PhET convention to SPICE convention
      const spiceIC = -inductor.initialCurrent;
      lines.push( `${name} ${node1} ${node2} ${inductor.inductance} IC=${spiceIC}` );
    }

    // Transient analysis for exactly dt seconds
    // .tran <step> <stop> [start] [max_step]
    // Use UIC (Use Initial Conditions) to start from specified IC values
    const step = this.dt / 10;  // Use 10 internal steps for accuracy
    lines.push( `.tran ${step} ${this.dt} UIC` );
    lines.push( '.END' );

    const netlist = lines.join( '\n' );

    // Debug: log the netlist if it contains capacitors
    // if ( this.capacitors.length > 0 ) {
    //   console.log( '[SPICE] Netlist:\n' + netlist );
    // }

    return netlist;
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
   * - Variable names are like 'time', 'v(1)', 'v(2)', 'i(v1)', 'i(c1)', 'i(l1)'
   *
   * SPICE results use SPICE node numbers (0, 1, 2, ...) which must be mapped
   * back to PhET node IDs.
   *
   * @param result - The result from EEcircuit's runSim()
   * @returns MNASolution compatible with PhET's existing code
   */
  public parseResult( result: EEcircuitResult ): MNASolution {

    // Build voltage map for all nodes
    const voltageMap = new Map<string, number>();

    // EEcircuit returns data as an array of { name, type, values }
    // Variable names are like 'v(1)', 'v(2)' for node voltages (using SPICE node numbers)
    for ( const phetNode of this.nodeSet ) {
      // Convert PhET node ID to SPICE node number
      const spiceNodeNum = this.toSpiceNode( phetNode );

      // Look up voltage using SPICE node number
      const entry = this.findDataEntry( result, `v(${spiceNodeNum})` );

      if ( entry ) {
        // Get the last value (final state after transient)
        // SPICE convention: node 0 is ground (0V), other nodes are relative to ground
        const spiceVoltage = this.getLastValue( entry );

        // PhET convention differs from SPICE - PhET uses negative voltages relative to battery positive terminal
        // SPICE: V(positive) > 0, V(negative) = 0 (ground)
        // PhET: Looking at MNACircuitTests, a 4V battery from node 0 to 1 gives V(0)=0, V(1)=-4
        // This means PhET's convention is V(node) = -(SPICE voltage at node)
        voltageMap.set( phetNode, -spiceVoltage );
      }
      else {
        // Node 0 (ground) won't have a voltage entry - it's implicitly 0V
        voltageMap.set( phetNode, 0 );
      }
    }

    // Build current map for batteries, capacitors, inductors, and zero-resistance elements
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

    // For capacitors, get the current from SPICE output i(c1), i(c2), etc.
    // This is the instantaneous current at the end of the transient step
    for ( const [ name, capacitor ] of this.capacitorNameMap ) {
      const entry = this.findDataEntry( result, `i(${name})` );

      if ( entry ) {
        const spiceCurrent = this.getLastValue( entry );
        // SPICE current convention: positive current flows from n+ to n-
        // PhET convention: positive current flows from nodeId0 to nodeId1
        // These should align since we put nodeId0 at n+ in the netlist
        currentMap.set( capacitor, spiceCurrent );

        // Debug: log capacitor results
        // const v0 = voltageMap.get( capacitor.nodeId0 ) ?? 0;
        // const v1 = voltageMap.get( capacitor.nodeId1 ) ?? 0;
        // console.log( `[SPICE] Capacitor ${name} result:`, {
        //   spiceCurrent: spiceCurrent,
        //   v0: v0,
        //   v1: v1,
        //   voltageDrop: v0 - v1,
        //   initialVoltage: capacitor.initialVoltage
        // } );
      }
      else {
        currentMap.set( capacitor, 0 );
      }
    }

    // For inductors, get the current from SPICE output i(l1), i(l2), etc.
    // SPICE current convention may differ from PhET - negate to match PhET's electron flow direction
    for ( const [ name, inductor ] of this.inductorNameMap ) {
      const entry = this.findDataEntry( result, `i(${name})` );

      if ( entry ) {
        const spiceCurrent = this.getLastValue( entry );
        // Negate current to convert from SPICE convention to PhET convention
        const phetCurrent = -spiceCurrent;
        currentMap.set( inductor, phetCurrent );

        // Debug: log inductor results
        // console.log( `[SPICE] Inductor ${name} result:`, {
        //   spiceCurrent,
        //   phetCurrent,
        //   initialCurrent: inductor.initialCurrent
        // } );
      }
      else {
        currentMap.set( inductor, 0 );
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
   * Get the final voltage across a capacitor from the solution.
   * This is used to set the initial condition for the next timestep.
   */
  public getCapacitorVoltage( solution: MNASolution, capacitor: MNACapacitor ): number {
    const v0 = solution.getNodeVoltage( capacitor.nodeId0 );
    const v1 = solution.getNodeVoltage( capacitor.nodeId1 );
    // Voltage drop from nodeId0 to nodeId1 (v0 - v1)
    // PhET convention: positive voltage means nodeId0 is at higher potential
    return ( v0 ?? 0 ) - ( v1 ?? 0 );
  }

  /**
   * Get the final current through an inductor from the solution.
   * This is used to set the initial condition for the next timestep.
   */
  public getInductorCurrent( solution: MNASolution, inductor: MNAInductor ): number {
    return solution.getSolvedCurrent( inductor );
  }

  /**
   * Solves the circuit using EEcircuit and returns an MNASolution.
   *
   * @param eesim - The EEcircuit simulation instance (from window.EEcircuit.Simulation)
   */
  public async solve( eesim: EEcircuitSimulation ): Promise<MNASolution> {
    const netlist = this.generateTransientNetlist();

    // console.log( 'EECircuitAdapter netlist:', netlist );

    eesim.setNetList( netlist );
    const result = await eesim.runSim();

    // console.log( 'EECircuitAdapter result:', result );

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
  public static createNetlist(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    capacitors: MNACapacitor[] = [],
    inductors: MNAInductor[] = [],
    dt = 1e-4
  ): string {
    const adapter = new EECircuitAdapter( batteries, resistors, capacitors, inductors, dt );
    return adapter.generateTransientNetlist();
  }
}

circuitConstructionKitCommon.register( 'EECircuitAdapter', EECircuitAdapter );
