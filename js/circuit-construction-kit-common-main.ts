// Copyright 2020-2025, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen from '../../joist/js/Screen.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CircuitConstructionKitCommonFluent from './CircuitConstructionKitCommonFluent.js';
import CCKCSim from './view/CCKCSim.js';
import CCKCDemoScreenView from './view/demo/CCKCDemoScreenView.js';

class Model {
  public reset(): void {
    // no-op, this is just a placeholder for the demo
  }
}

// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  new CCKCSim( CircuitConstructionKitCommonFluent[ 'circuit-construction-kit-common' ].titleStringProperty, [
    new Screen<Model, CCKCDemoScreenView>( () => {return new Model();}, model => new CCKCDemoScreenView(), {
      tandem: Tandem.GLOBAL_VIEW.createTandem( 'demoScreenView' )
    } )
  ] ).start();
} );