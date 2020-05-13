// Copyright 2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import CCKCDemoScreenView from './view/demo/CCKCDemoScreenView.js';
import circuitConstructionKitCommonStrings from './circuitConstructionKitCommonStrings.js';

const simOptions = {
  title: circuitConstructionKitCommonStrings[ 'circuit-construction-kit-common' ].title,
  credits: {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  }
};


// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  new Sim( 'CCK Common', [
    new Screen( () => {return {};}, model => new CCKCDemoScreenView() )
  ], simOptions ).start();
} );