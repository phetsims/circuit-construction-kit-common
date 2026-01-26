// Copyright 2026, University of Colorado Boulder

/**
 * SpiceSolverManager is a singleton that manages async circuit solving with ngspice WASM.
 *
 * Uses a simple callback-based pattern: when a solve completes, the callback is invoked
 * to apply results directly to circuit elements. Solves are processed sequentially
 * (SPICE limitation) via a queue.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import SpiceAdapter from './SpiceAdapter.js';
import type MNABattery from '../mna/MNABattery.js';
import type MNACapacitor from '../mna/MNACapacitor.js';
import type MNAInductor from '../mna/MNAInductor.js';
import type MNAResistor from '../mna/MNAResistor.js';
import type MNASolution from '../mna/MNASolution.js';

// Import the PhET SPICE simulation wrapper (ngspice compiled to WASM)
import { Simulation } from './Simulation.js';

// Type for the SPICE simulation
type SpiceSimulation = {
  start: () => Promise<void>;
  setNetList: ( netlist: string ) => void;
  runSim: () => Promise<unknown>;
  getError: () => string[];
};

export default class SpiceSolverManager {

  // Singleton instance
  public static readonly instance = new SpiceSolverManager();

  // The SPICE simulation instance
  private eesim: SpiceSimulation | null = null;

  // Track if initialization has completed
  private initialized = false;

  // Sequential solve queue (SPICE can only run one solve at a time)
  private solveQueue: Array<{
    adapter: SpiceAdapter;
    onSolved: ( solution: MNASolution, adapter: SpiceAdapter ) => void;
  }> = [];

  // Whether we're currently processing a solve
  private isProcessing = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Initialize the SPICE simulation. Must be called once at sim startup.
   */
  public async initialize(): Promise<void> {
    if ( this.initialized ) {
      return;
    }

    // Instantiate the SPICE simulation from the bundled ngspice WASM
    this.eesim = new Simulation() as SpiceSimulation;
    await this.eesim.start();
    this.initialized = true;

    console.log( 'SpiceSolverManager initialized (ngspice WASM)' );
  }

  /**
   * Request a circuit solve. When the solve completes, onSolved is called with the solution.
   * Solves are queued and processed sequentially.
   *
   * @param batteries - DC voltage sources (for AC sources, use the instantaneous voltage)
   * @param resistors - Resistive elements
   * @param capacitors - Capacitors with initial voltage state
   * @param inductors - Inductors with initial current state
   * @param dt - Timestep for transient analysis (in seconds)
   * @param onSolved - Callback with solution and adapter (adapter needed to extract C/L state)
   */
  public requestSolve(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    capacitors: MNACapacitor[],
    inductors: MNAInductor[],
    dt: number,
    onSolved: ( solution: MNASolution, adapter: SpiceAdapter ) => void
  ): void {
    if ( !this.initialized || !this.eesim ) {
      console.warn( 'SpiceSolverManager.requestSolve called before initialization' );
      return;
    }

    // Skip if no voltage sources (nothing to drive the circuit)
    if ( batteries.length === 0 ) {
      return;
    }

    // Check if the group forms a complete loop
    if ( !this.hasCompletePath( batteries, resistors, capacitors, inductors ) ) {
      return;
    }

    // Add to queue
    const adapter = new SpiceAdapter( batteries, resistors, capacitors, inductors, dt );
    this.solveQueue.push( { adapter: adapter, onSolved: onSolved } );

    // Start processing if not already
    this.processQueue();
  }

  /**
   * Process the next solve in the queue.
   */
  private processQueue(): void {
    if ( this.isProcessing || this.solveQueue.length === 0 ) {
      return;
    }

    this.isProcessing = true;
    const { adapter, onSolved } = this.solveQueue.shift()!;

    this.solveAsync( adapter ).then( solution => {
      onSolved( solution, adapter );
      this.isProcessing = false;
      this.processQueue(); // Process next in queue
    } ).catch( error => {
      console.warn( 'Spice solve failed:', error );
      this.isProcessing = false;
      this.processQueue(); // Continue with next even if one fails
    } );
  }

  /**
   * Check if the circuit has at least one complete path (loop) that SPICE can solve.
   * This prevents sending unsolvable circuits to SPICE which would cause singularity errors.
   */
  private hasCompletePath(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    capacitors: MNACapacitor[],
    inductors: MNAInductor[]
  ): boolean {

    // Build adjacency list for the circuit graph
    const adjacency = new Map<string, Set<string>>();

    const addEdge = ( node1: string, node2: string ) => {
      if ( !adjacency.has( node1 ) ) {
        adjacency.set( node1, new Set() );
      }
      if ( !adjacency.has( node2 ) ) {
        adjacency.set( node2, new Set() );
      }
      adjacency.get( node1 )!.add( node2 );
      adjacency.get( node2 )!.add( node1 );
    };

    // Add all elements as edges
    for ( const battery of batteries ) {
      addEdge( battery.nodeId0, battery.nodeId1 );
    }
    for ( const resistor of resistors ) {
      addEdge( resistor.nodeId0, resistor.nodeId1 );
    }
    for ( const capacitor of capacitors ) {
      addEdge( capacitor.nodeId0, capacitor.nodeId1 );
    }
    for ( const inductor of inductors ) {
      addEdge( inductor.nodeId0, inductor.nodeId1 );
    }

    // For each battery, check if there's a path from one terminal back to the other
    // (without using the battery itself - i.e., through other elements)
    for ( const battery of batteries ) {
      const start = battery.nodeId0;
      const end = battery.nodeId1;

      // BFS to find if there's a path from start to end through other elements
      const visited = new Set<string>();
      const queue: string[] = [ start ];
      visited.add( start );

      let foundPath = false;
      while ( queue.length > 0 && !foundPath ) {
        const current = queue.shift()!;

        const neighbors = adjacency.get( current );
        if ( neighbors ) {
          for ( const neighbor of neighbors ) {
            // Skip the direct battery connection
            if ( current === start && neighbor === end ) {
              continue;
            }
            if ( current === end && neighbor === start ) {
              continue;
            }

            if ( neighbor === end ) {
              foundPath = true;
              break;
            }

            if ( !visited.has( neighbor ) ) {
              visited.add( neighbor );
              queue.push( neighbor );
            }
          }
        }
      }

      if ( foundPath ) {
        return true; // At least one battery has a complete loop
      }
    }

    return false; // No complete loops found
  }

  /**
   * Internal async solve using SpiceAdapter.
   */
  private async solveAsync( adapter: SpiceAdapter ): Promise<MNASolution> {
    const netlist = adapter.generateTransientNetlist();

    this.eesim!.setNetList( netlist );
    const result = await this.eesim!.runSim();

    // Check for errors
    const errors = this.eesim!.getError();
    if ( errors && errors.length > 0 ) {
      console.warn( 'Spice errors:', errors );
    }

    return adapter.parseResult( result as Parameters<typeof adapter.parseResult>[0] );
  }
}

circuitConstructionKitCommon.register( 'SpiceSolverManager', SpiceSolverManager );
