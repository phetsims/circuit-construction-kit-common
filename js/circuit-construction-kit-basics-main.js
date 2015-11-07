// Copyright 2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CircuitConstructionKitBasicsScreen = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/CircuitConstructionKitBasicsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!CIRCUIT_CONSTRUCTION_KIT_BASICS/circuit-construction-kit-basics.title' );

  var simOptions = {
    credits: {
      //TODO fill in proper credits, all of these fields are optional, see joist.AboutDialog
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      qualityAssurance: '',
      graphicArts: '',
      thanks: ''
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  // Circuit Construction Kit: Basics has unit tests for checking the mathematics for the Modified Nodal Analysis
  // algorithm.  In order to load the classes into an accessible namespace, the *-config.js and *-main.js are loaded
  // however, when running the unit tests we don't also want to launch the simulation.
  if ( !window.circuitConstructionKitBasicsTestSuite ) {
    SimLauncher.launch( function() {
      var sim = new Sim( simTitle, [ new CircuitConstructionKitBasicsScreen() ], simOptions );
      sim.start();
    } );
  }
} );