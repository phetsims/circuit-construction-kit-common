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

  // Cached result from the last completed solve (solution + maps)
  private cachedResult: CachedSolveResult | null = null;

  // Promise for the currently running solve (null if not solving)
  private pendingPromise: Promise<CachedSolveResult> | null = null;

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
   * Returns the cached result from the previous solve (solution + maps).
   * May return null if no solve has completed yet.
   */
  public getCachedResult(): CachedSolveResult | null {
    return this.cachedResult;
  }

  /**
   * Returns true if a solve is currently in progress.
   */
  public isSolving(): boolean {
    return this.pendingPromise !== null;
  }

  /**
   * Request an async solve with the given circuit elements and maps.
   * The maps are stored alongside the solution so they can be used to apply results correctly.
   * If a solve is already in progress, this request is skipped (next frame will trigger another).
   */
  public requestSolve(
    batteries: MNABattery[],
    resistors: MNAResistor[],
    batteryMap: Map<string, VoltageSource>,
    batteryMNAMap: Map<string, MNABattery>,
    resistorMap: Map<string, CircuitElement>,
    nonParticipants: CircuitElement[]
  ): void {
    if ( !this.initialized || !this.eesim ) {
      console.warn( 'EEcircuitSolverManager.requestSolve called before initialization' );
      return;
    }

    // If a solve is already in progress, let it complete
    // The next frame will trigger another solve with updated values
    if ( this.pendingPromise ) {
      return;
    }

    // Create adapter and start async solve
    const adapter = new EECircuitAdapter( batteries, resistors );

    // Store copies of the maps to use when solution completes
    const capturedBatteryMap = new Map( batteryMap );
    const capturedBatteryMNAMap = new Map( batteryMNAMap );
    const capturedResistorMap = new Map( resistorMap );
    const capturedNonParticipants = [ ...nonParticipants ];

    this.pendingPromise = this.solveAsync( adapter ).then( solution => {
      this.cachedResult = {
        solution: solution,
        batteryMap: capturedBatteryMap,
        batteryMNAMap: capturedBatteryMNAMap,
        resistorMap: capturedResistorMap,
        nonParticipants: capturedNonParticipants
      };
      this.pendingPromise = null;
      return this.cachedResult;
    } ).catch( error => {
      console.error( 'EEcircuit solve failed:', error );
      this.pendingPromise = null;
      throw error;
    } );
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
