// Copyright 2021, University of Colorado Boulder

/**
 * ResistorColors tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import LUDecompositionDecimal from '../../../dot/js/LUDecompositionDecimal.js';
import Matrix from '../../../dot/js/Matrix.js';

QUnit.module( 'LUDecompositionDecimal' );

// @ts-ignore
const LUDecimal = Decimal.clone( {
  // precision: 16 // default precision for {number}
  precision: 100
} );

QUnit.test( 'test decomposition', assert => {

  const stringToMatrix = ( string: string ) => {
    const data = string.split( '\n' ).map( row => row.trim().split( ' ' ) );
    const m = data.length;
    const n = data[ 0 ].length;
    const matrix = new Matrix( m, n );
    for ( let i = 0; i < m; i++ ) {
      for ( let k = 0; k < n; k++ ) {
        matrix.set( i, k, parseFloat( data[ i ][ k ] ) );
      }
    }
    return matrix;
  };
  const matrix = stringToMatrix( `0 1 0 0 0 0 
0 0 4831038889.801163 -4830038889.801163 0 -1000000 
0 0 -4830038889.801163 4830038889.901163 -0.1 0 
0 0 0 -0.1 0.1 0 
-1 0 -1000000 0 0 1000000 
0 -1 0 0 0 1` );

  const b = stringToMatrix( `0 
0 
0 
0 
0 
100000 ` );
  // console.log( b.toString() );

  const x = matrix.solve( b );
  // console.log( x.toString() );

  // @ts-ignore
  assert.ok( x.entries[ 0 ] === 0.02496337890625 );// wrong

  const x2 = new LUDecompositionDecimal( matrix, LUDecimal ).solve( b, LUDecimal );
  assert.ok( x2.entries[ 0 ] === 5.274e-86 ); // still wrong, but less wrong
} );