// Copyright 2017-2021, University of Colorado Boulder

/**
 * ResistorColors tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ResistorColors from './ResistorColors.js';

QUnit.module( 'ResistorColors' );

QUnit.test( 'test resistor colors', assert => {
  assert.deepEqual( ResistorColors.getColorNames( 0 ), [ 'black' ], '0 resistance should have one black band' );
  assert.deepEqual( ResistorColors.getColorNames( 1 ), [ 'brown', 'black', 'gold', 'gold' ], '1 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 10 ), [ 'brown', 'black', 'black', 'gold' ], '10 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 100 ), [ 'brown', 'black', 'brown', 'gold' ], '100 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 1000 ), [ 'brown', 'black', 'red', 'gold' ], '100 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 4700 ), [ 'yellow', 'violet', 'red', 'gold' ], '4700 ohm ' );
  assert.deepEqual( ResistorColors.getColorNames( 9900 ), [ 'white', 'white', 'red', 'gold' ], '9900 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 55 ), [ 'green', 'green', 'black', 'gold' ], '55 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 34.5 ), [ 'orange', 'yellow', 'black', 'gold' ], '34.5 ohm' );
  assert.deepEqual( ResistorColors.getColorNames( 99.5 ), [ 'white', 'white', 'black', 'gold' ], '99.5 ohm' );
  assert.deepEqual( ResistorColors.getColorNames( 10.5 ), [ 'brown', 'brown', 'black', 'gold' ], '10.5 ohm' );
  assert.deepEqual( ResistorColors.getColorNames( 7.5 ), [ 'violet', 'green', 'gold', 'gold' ], '7.5 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 20 ), [ 'red', 'black', 'black', 'gold' ], '20 ohm resistor' );
  assert.deepEqual( ResistorColors.getColorNames( 88000 ), [ 'gray', 'gray', 'orange', 'gold' ], '88000 ohm' );
} );