// Copyright 2025, University of Colorado Boulder

/**
 * SpiceLoader initializes the ngspice WASM engine by combining the WASM binary
 * and Emscripten glue code from sherpa.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { NGSPICE_WASM_BASE64 } from '../../../../../sherpa/lib/ngspice-wasm-2025.js';
import { Module } from '../../../../../sherpa/lib/ngspice-emscripten-glue-2025.js';

// Decode base64 to binary
function base64ToArrayBuffer( base64: string ): Uint8Array {
  const binaryString = atob( base64 );
  const bytes = new Uint8Array( binaryString.length );
  for ( let i = 0; i < binaryString.length; i++ ) {
    bytes[ i ] = binaryString.charCodeAt( i );
  }
  return bytes;
}

// Create blob URL for WASM
const wasmBytes = base64ToArrayBuffer( NGSPICE_WASM_BASE64 );
const wasmBlob = new Blob( [ wasmBytes ], { type: 'application/wasm' } );
const wasmUrl = URL.createObjectURL( wasmBlob );

type ModuleArg = {
  locateFile?: ( path: string, prefix: string ) => string;
  [ key: string ]: unknown;
};

// Patched module that uses our blob URL
const PatchedModule = async function( moduleArg: ModuleArg = {} ): Promise<unknown> {
  moduleArg.locateFile = ( path: string ) => {
    if ( path.endsWith( '.wasm' ) ) {
      return wasmUrl;
    }
    return path;
  };
  return Module( moduleArg );
};

export { PatchedModule as Module, wasmUrl };
