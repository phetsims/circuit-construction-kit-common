// Copyright 2025, University of Colorado Boulder

/**
 * EEcircuitSolverManager is a singleton that manages async circuit solving with EEcircuit.
 *
 * Since Circuit.step() is synchronous but EEcircuit is async, this manager uses a buffering pattern:
 * - Previous frame's solution is cached and used for display
 * - New solves are queued asynchronously
 * - When solve completes, cache is updated for next frame
 *
 * This results in at most one frame of latency, which is imperceptible for DC circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type CircuitElement from '../CircuitElement.js';
import type VoltageSource from '../VoltageSource.js';
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

// Cached result includes the solution AND the maps used to apply it
export type CachedSolveResult = {
  solution: MNASolution;
  batteryMap: Map<string, VoltageSource>;
  batteryMNAMap: Map<string, MNABattery>; // Maps node key to MNABattery for current lookup
  resistorMap: Map<string, CircuitElement>;
  nonParticipants: CircuitElement[];
};

export default class EEcircuitSolverManager {

  // Singleton instance
  public static readonly instance = new EEcircuitSolverManager();

  // The EEcircuit simulation instance
  private eesim: EEcircuitSimulation | null = null;

  // Double-buffer pattern for async results:
  // - currentResults: Results returned to callers (from previous frame's solves)
  // - pendingResults: Results being built from current frame's solves
  private currentResults: CachedSolveResult[] = [];
  private pendingResults: CachedSolveResult[] = [];

  // Pending solves queue - we process groups sequentially
  private pendingGroups: Array<{
    batteries: MNABattery[];
    resistors: MNAResistor[];
    batteryMap: Map<string, VoltageSource>;
    batteryMNAMap: Map<string, MNABattery>;
    resistorMap: Map<string, CircuitElement>;
    nonParticipants: CircuitElement[];
  }> = [];

  // Track the number of groups queued this frame (to know when batch is complete)
  private groupsQueuedThisFrame = 0;
  private groupsCompletedThisFrame = 0;

  // Whether we're currently processing the queue
  private isProcessing = false;

  // Track if initialization has completed
  private initialized = false;

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
   * Returns all cached results from completed solves (one per group).
   * Returns the stable "current" buffer - results from the most recently completed batch.
   */
  public getAllCachedResults(): CachedSolveResult[] {
    console.log( `[EEcircuit] getAllCachedResults: ${this.currentResults.length} current, ${this.pendingResults.length} pending, isProcessing=${this.isProcessing}` );
    return this.currentResults;
  }

  /**
   * Start a new batch of solves. Call this at the beginning of each frame.
   * This resets the pending queue and counters but preserves currentResults
   * so they remain available until the new batch completes.
   */
  public startNewBatch(): void {
    this.pendingGroups = [];
    this.groupsQueuedThisFrame = 0;
    this.groupsCompletedThisFrame = 0;
    this.pendingResults = [];
  }

  /**
   * Queue a group for solving. Groups are processed sequentially.
   * Call processAllGroups() after queuing all groups to start solving.
   */
  public requestSolveForGroup(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    batteryMap: Map<string, VoltageSource>,
    batteryMNAMap: Map<string, MNABattery>,
    resistorMap: Map<string, CircuitElement>,
    nonParticipants: CircuitElement[]
  ): void {
    if ( !this.initialized || !this.eesim ) {
      console.warn( 'EEcircuitSolverManager.requestSolveForGroup called before initialization' );
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

    // Track how many groups are queued this frame
    this.groupsQueuedThisFrame++;

    // Add to pending queue
    this.pendingGroups.push( {
      batteries: batteries,
      resistors: resistors,
      batteryMap: new Map( batteryMap ),
      batteryMNAMap: new Map( batteryMNAMap ),
      resistorMap: new Map( resistorMap ),
      nonParticipants: [ ...nonParticipants ]
    } );

    // Start processing if not already
    this.processNextGroup();
  }

  /**
   * Process the next group in the queue.
   * Results are added to pendingResults. When the batch completes, buffers are swapped.
   */
  private processNextGroup(): void {
    console.log( `[EEcircuit] processNextGroup: isProcessing=${this.isProcessing}, pendingGroups=${this.pendingGroups.length}, queued=${this.groupsQueuedThisFrame}, completed=${this.groupsCompletedThisFrame}` );
    if ( this.isProcessing || this.pendingGroups.length === 0 ) {
      return;
    }

    this.isProcessing = true;

    const group = this.pendingGroups.shift()!;
    const adapter = new EECircuitAdapter( group.batteries, group.resistors );

    console.log( '[EEcircuit] Starting async solve...' );
    this.solveAsync( adapter ).then( solution => {
      console.log( '[EEcircuit] Solve completed, adding to pendingResults' );

      // Add to pending results (not current - those are still being read)
      this.pendingResults.push( {
        solution: solution,
        batteryMap: group.batteryMap,
        batteryMNAMap: group.batteryMNAMap,
        resistorMap: group.resistorMap,
        nonParticipants: group.nonParticipants
      } );

      this.groupsCompletedThisFrame++;

      // Check if batch is complete (all queued groups have been solved)
      if ( this.groupsCompletedThisFrame === this.groupsQueuedThisFrame && this.pendingGroups.length === 0 ) {
        console.log( `[EEcircuit] Batch complete! Swapping buffers: ${this.pendingResults.length} results` );
        // Swap buffers - pending becomes current
        this.currentResults = this.pendingResults;
        this.pendingResults = [];
      }

      this.isProcessing = false;
      this.processNextGroup(); // Process next group in queue
    } ).catch( error => {
      console.warn( 'EEcircuit solve failed for group:', error );
      this.groupsCompletedThisFrame++;

      // Still check for batch completion even on failure
      if ( this.groupsCompletedThisFrame === this.groupsQueuedThisFrame && this.pendingGroups.length === 0 ) {
        console.log( `[EEcircuit] Batch complete (with failures)! Swapping buffers: ${this.pendingResults.length} results` );
        this.currentResults = this.pendingResults;
        this.pendingResults = [];
      }

      this.isProcessing = false;
      this.processNextGroup(); // Continue with next group even if one fails
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

    // console.log( 'EEcircuit solving netlist:\n', netlist );

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
