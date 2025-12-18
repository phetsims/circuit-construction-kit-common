// Copyright 2025, University of Colorado Boulder

/**
 * EEcircuitSolverManager is a singleton that manages async circuit solving with EEcircuit.
 *
 * Uses a simple callback-based pattern: when a solve completes, the callback is invoked
 * to apply results directly to circuit elements. Solves are processed sequentially
 * (SPICE limitation) via a queue.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import EECircuitAdapter from './EECircuitAdapter.js';
import type MNABattery from './mna/MNABattery.js';
import type MNAResistor from './mna/MNAResistor.js';
import type MNASolution from './mna/MNASolution.js';

// Type for EEcircuit simulation (loaded globally via preload script)
type EEcircuitSimulation = {
  start: () => Promise<void>;
  setNetList: ( netlist: string ) => void;
  runSim: () => Promise<unknown>;
  getError: () => string[];
};

export default class EEcircuitSolverManager {

  // Singleton instance
  public static readonly instance = new EEcircuitSolverManager();

  // The EEcircuit simulation instance
  private eesim: EEcircuitSimulation | null = null;

  // Track if initialization has completed
  private initialized = false;

  // Sequential solve queue (SPICE can only run one solve at a time)
  private solveQueue: Array<{
    adapter: EECircuitAdapter;
    onSolved: ( solution: MNASolution ) => void;
  }> = [];

  // Whether we're currently processing a solve
  private isProcessing = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Initialize the EEcircuit simulation. Must be called once at sim startup.
   */
  public async initialize(): Promise<void> {
    if ( this.initialized ) {
      return;
    }

    // EEcircuit is loaded as a preload script and attached to window
    this.eesim = new ( window as unknown as { EEcircuit: { Simulation: new() => EEcircuitSimulation } } ).EEcircuit.Simulation();
    await this.eesim.start();
    this.initialized = true;

    console.log( 'EEcircuitSolverManager initialized' );
  }

  /**
   * Request a circuit solve. When the solve completes, onSolved is called with the solution.
   * Solves are queued and processed sequentially.
   */
  public requestSolve(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    onSolved: ( solution: MNASolution ) => void
  ): void {
    if ( !this.initialized || !this.eesim ) {
      console.warn( 'EEcircuitSolverManager.requestSolve called before initialization' );
      return;
    }

    // Skip if no batteries
    if ( batteries.length === 0 ) {
      return;
    }

    // Check if the group forms a complete loop
    if ( !this.hasCompletePath( batteries, resistors ) ) {
      return;
    }

    // Add to queue
    const adapter = new EECircuitAdapter( batteries, resistors );
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
      onSolved( solution );
      this.isProcessing = false;
      this.processQueue(); // Process next in queue
    } ).catch( error => {
      console.warn( 'EEcircuit solve failed:', error );
      this.isProcessing = false;
      this.processQueue(); // Continue with next even if one fails
    } );
  }

  /**
   * Check if the circuit has at least one complete path (loop) that SPICE can solve.
   * This prevents sending unsolvable circuits to SPICE which would cause singularity errors.
   */
  private hasCompletePath( batteries: MNABattery[], resistors: MNAResistor[] ): boolean {

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
   * Internal async solve using EECircuitAdapter.
   */
  private async solveAsync( adapter: EECircuitAdapter ): Promise<MNASolution> {
    const netlist = adapter.generateTransientNetlist();

    this.eesim!.setNetList( netlist );
    const result = await this.eesim!.runSim();

    // Check for errors
    const errors = this.eesim!.getError();
    if ( errors && errors.length > 0 ) {
      console.warn( 'EEcircuit errors:', errors );
    }

    return adapter.parseResult( result as Parameters<typeof adapter.parseResult>[0] );
  }
}

circuitConstructionKitCommon.register( 'EEcircuitSolverManager', EEcircuitSolverManager );
