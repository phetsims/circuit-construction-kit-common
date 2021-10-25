// Copyright 2017-2021, University of Colorado Boulder

/**
 * Unit tests. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import './model/analysis/LTACircuitTests.js';
import './model/analysis/mna/MNACircuitTests.js';
import './view/ResistorColorsTests.js';
import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import './model/LUDecompositionDecimalTest.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();