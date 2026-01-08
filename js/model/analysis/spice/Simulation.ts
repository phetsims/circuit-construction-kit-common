// Copyright 2026, University of Colorado Boulder

/**
 * PhET Minimal SPICE Engine
 * A focused wrapper around ngspice WASM for Circuit Construction Kit.
 *
 * Provides the same interface as EEcircuit's Simulation class:
 *   - start() -> Promise<void>
 *   - setNetList(string) -> void
 *   - runSim() -> Promise<Result>
 *   - getError() -> string[]
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Module, wasmUrl } from './SpiceLoader.js';

type SpiceModule = {
  FS: {
    writeFile: ( path: string, data: string | Uint8Array ) => void;
    readFile: ( path: string ) => Uint8Array;
  };
  Asyncify: {
    handleAsync: ( fn: () => Promise<void> ) => void;
  };
  setGetInput: ( fn: () => string ) => void;
  setHandleThings: ( fn: () => void ) => void;
  runThings: () => void;
};

type VariableInfo = {
  name: string;
  type: string;
};

type DataEntry = {
  name: string;
  type: string;
  values: ( number | { real: number; img: number } )[];
};

type SimulationResult = {
  error?: string;
  header?: string;
  numVariables?: number;
  variableNames?: string[];
  numPoints?: number;
  dataType?: 'real' | 'complex';
  data: DataEntry[];
};

class Simulation {

  protected _module: SpiceModule | null = null;
  protected _initialized = false;
  protected _netlist = '';
  protected _errors: string[] = [];
  protected _info = '';

  // Command sequence for running a simulation
  protected _commands = [ ' ', 'source /circuit.cir', 'run', 'write /out.raw' ];
  protected _cmdIndex = 0;

  // Promise resolvers
  protected _initResolve: ( () => void ) | null = null;
  protected _runResolve: ( ( result: SimulationResult ) => void ) | null = null;
  protected _waitResolve: ( () => void ) | null = null;

  /**
   * Initialize the WASM module. Must be called once before solving.
   */
  public async start(): Promise<void> {
    return new Promise( resolve => {
      this._initResolve = resolve;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._startInternal();
    } );
  }

  protected async _startInternal(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const moduleOptions = {
      noInitialRun: true,

      print: ( msg = '' ) => {
        self._info += msg + '\n';
      },

      printErr: ( msg = '' ) => {
        // Filter expected warnings
        if ( msg !== 'Warning: can\'t find the initialization file spinit.' &&
             msg !== 'Using SPARSE 1.3 as Direct Linear Solver' ) {
          console.warn( 'ngspice:', msg );
          self._errors.push( msg );
        }
      },

      setGetInput: () => ' ',
      setHandleThings: () => { /* empty */ },
      runThings: () => { /* empty */ }
    };

    this._module = await Module( moduleOptions ) as SpiceModule;

    // Set up minimal virtual filesystem
    this._module.FS.writeFile( '/spinit', '* PhET ngspice init\n' );
    this._module.FS.writeFile( '/proc/meminfo', '' );

    // Write a dummy circuit for the initial cycle (avoids "no circuits loaded" error)
    this._module.FS.writeFile( '/circuit.cir', `Dummy Init Circuit
V1 1 0 DC 1
R1 1 0 1
.tran 1m 1m
.END` );

    // Set up command input handler
    this._module.setGetInput( () => {
      if ( self._cmdIndex < self._commands.length ) {
        const cmd = self._commands[ self._cmdIndex++ ];
        return cmd;
      }
      return ' ';
    } );

    // Set up the async handler for simulation cycles
    this._module.setHandleThings( () => {
      self._module!.Asyncify.handleAsync( async () => {
        // Check if command sequence is complete
        if ( self._cmdIndex >= self._commands.length ) {
          // Read and parse results
          try {
            const rawData = self._module!.FS.readFile( '/out.raw' );
            const result = self._parseOutput( rawData );

            if ( self._runResolve ) {
              self._runResolve( result );
              self._runResolve = null;
            }
          }
          catch( e ) {
            console.error( 'Failed to read results:', e );
            if ( self._runResolve ) {
              self._runResolve( { error: ( e as Error ).message, data: [] } );
              self._runResolve = null;
            }
          }

          // Signal initialization complete on first run
          if ( !self._initialized ) {
            self._initialized = true;
            if ( self._initResolve ) {
              self._initResolve();
              self._initResolve = null;
            }
          }

          // Wait for next runSim() call
          await new Promise<void>( resolve => {
            self._waitResolve = resolve;
          } );

          // Write new netlist for next run
          self._module!.FS.writeFile( '/circuit.cir', self._netlist );
          self._cmdIndex = 0;
        }
      } );
    } );

    // Start ngspice main loop
    this._module.runThings();
  }

  /**
   * Set the netlist for the next simulation.
   */
  public setNetList( netlist: string ): void {
    this._netlist = netlist;
  }

  /**
   * Run the simulation and return results.
   */
  public async runSim(): Promise<SimulationResult> {
    if ( !this._initialized ) {
      throw new Error( 'Call start() first' );
    }

    // Clear errors for this run
    this._errors = [];
    this._info = '';

    // Write netlist
    this._module!.FS.writeFile( '/circuit.cir', this._netlist );
    this._cmdIndex = 0;

    return new Promise( resolve => {
      this._runResolve = resolve;
      // Continue the simulation loop
      if ( this._waitResolve ) {
        this._waitResolve();
        this._waitResolve = null;
      }
    } );
  }

  /**
   * Get errors from the last simulation.
   */
  public getError(): string[] {
    return this._errors;
  }

  /**
   * Get info/output from the last simulation.
   */
  public getInfo(): string {
    return this._info;
  }

  /**
   * Check if initialized.
   */
  public isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Parse ngspice binary output format.
   */
  protected _parseOutput( rawData: Uint8Array ): SimulationResult {
    const text = new TextDecoder().decode( rawData );
    const binaryOffset = text.indexOf( 'Binary:' );

    if ( binaryOffset === -1 ) {
      return { error: 'No binary data found', data: [] };
    }

    const header = text.substring( 0, binaryOffset );
    const lines = header.split( '\n' );

    // Parse header
    const numVarsLine = lines.find( l => l.startsWith( 'No. Variables' ) );
    const numPointsLine = lines.find( l => l.startsWith( 'No. Points' ) );
    const flagsLine = lines.find( l => l.startsWith( 'Flags' ) );

    const numVars = parseInt( numVarsLine?.split( ':' )[ 1 ] || '0', 10 );
    const numPoints = parseInt( numPointsLine?.split( ':' )[ 1 ] || '0', 10 );
    const isComplex = flagsLine?.includes( 'complex' ) || false;

    // Parse variable names
    const varStartIdx = lines.indexOf( 'Variables:' ) + 1;
    const variables: VariableInfo[] = [];
    for ( let i = 0; i < numVars; i++ ) {
      const line = lines[ varStartIdx + i ];
      if ( line ) {
        const parts = line.trim().split( /\s+/ );
        variables.push( {
          name: parts[ 1 ] || '',
          type: parts[ 2 ] || 'notype'
        } );
      }
    }

    // Parse binary data
    const view = new DataView( rawData.buffer, binaryOffset + 8 );
    const values: ( number | { real: number; img: number } )[] = [];

    if ( isComplex ) {
      for ( let i = 0; i < view.byteLength - 15; i += 16 ) {
        values.push( {
          real: view.getFloat64( i, true ),
          img: view.getFloat64( i + 8, true )
        } );
      }
    }
    else {
      for ( let i = 0; i < view.byteLength - 7; i += 8 ) {
        values.push( view.getFloat64( i, true ) );
      }
    }

    // Reshape into per-variable arrays
    const data: DataEntry[] = variables.map( v => ( {
      name: v.name,
      type: v.type,
      values: []
    } ) );

    for ( let pt = 0; pt < numPoints; pt++ ) {
      for ( let v = 0; v < numVars; v++ ) {
        const idx = pt * numVars + v;
        if ( idx < values.length ) {
          data[ v ].values.push( values[ idx ] );
        }
      }
    }

    return {
      header: header,
      numVariables: numVars,
      variableNames: variables.map( v => v.name ),
      numPoints: numPoints,
      dataType: isComplex ? 'complex' : 'real',
      data: data.filter( d => d.type !== 'notype' )
    };
  }
}

/**
 * PatchedSimulation extends Simulation to use the wasmUrl from SpiceLoader
 * instead of relying on the default Module locateFile behavior.
 */
class PatchedSimulation extends Simulation {

  protected override async _startInternal(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const moduleOptions = {
      noInitialRun: true,
      locateFile: ( path: string, prefix: string ) => {
        if ( path.endsWith( '.wasm' ) ) {
          return wasmUrl;
        }
        return prefix + path;
      },
      print: ( msg = '' ) => {
        self._info += msg + '\n';
      },
      printErr: ( msg = '' ) => {
        if ( msg !== 'Warning: can\'t find the initialization file spinit.' &&
             msg !== 'Using SPARSE 1.3 as Direct Linear Solver' ) {
          console.warn( 'ngspice:', msg );
          self._errors.push( msg );
        }
      },
      setGetInput: () => ' ',
      setHandleThings: () => { /* empty */ },
      runThings: () => { /* empty */ }
    };

    this._module = await Module( moduleOptions ) as SpiceModule;

    this._module.FS.writeFile( '/spinit', '* PhET ngspice init\n' );
    this._module.FS.writeFile( '/proc/meminfo', '' );
    this._module.FS.writeFile( '/circuit.cir', `Dummy Init Circuit
V1 1 0 DC 1
R1 1 0 1
.tran 1m 1m
.END` );

    this._module.setGetInput( () => {
      if ( self._cmdIndex < self._commands.length ) {
        const cmd = self._commands[ self._cmdIndex++ ];
        return cmd;
      }
      return ' ';
    } );

    this._module.setHandleThings( () => {
      self._module!.Asyncify.handleAsync( async () => {
        if ( self._cmdIndex >= self._commands.length ) {
          try {
            const rawData = self._module!.FS.readFile( '/out.raw' );
            const result = self._parseOutput( rawData );
            if ( self._runResolve ) {
              self._runResolve( result );
              self._runResolve = null;
            }
          }
          catch( e ) {
            console.error( 'Failed to read results:', e );
            if ( self._runResolve ) {
              self._runResolve( { error: ( e as Error ).message, data: [] } );
              self._runResolve = null;
            }
          }

          if ( !self._initialized ) {
            self._initialized = true;
            if ( self._initResolve ) {
              self._initResolve();
              self._initResolve = null;
            }
          }

          await new Promise<void>( resolve => {
            self._waitResolve = resolve;
          } );

          self._module!.FS.writeFile( '/circuit.cir', self._netlist );
          self._cmdIndex = 0;
        }
      } );
    } );

    this._module.runThings();
  }
}

export { PatchedSimulation as Simulation };
export type { SimulationResult };

if ( typeof window !== 'undefined' ) {
  // @ts-expect-error - Adding global for debugging/compatibility
  window.PhetSpice = { Simulation: PatchedSimulation };
}
