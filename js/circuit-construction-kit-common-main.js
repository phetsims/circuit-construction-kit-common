// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import CircuitConstructionKitCommonStrings from './CircuitConstructionKitCommonStrings.js';
import CCKCDemoScreenView from './view/demo/CCKCDemoScreenView.js';

// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  new Sim( CircuitConstructionKitCommonStrings[ 'circuit-construction-kit-common' ].titleStringProperty, [
    new Screen( () => {return {};}, model => new CCKCDemoScreenView() )
  ] ).start();
} );