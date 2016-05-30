// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );

  var getQueryParameter = phet.chipper.getQueryParameter;

  var CircuitConstructionKitQueryParameters = {

    // Show the voltage above each node, for debugging the circuit physics
    showNodeVoltages: !!getQueryParameter( 'showNodeVoltages' ),

    dev: !!getQueryParameter( 'dev' ),

    showPlayPauseButton: !!getQueryParameter( 'showPlayPauseButton' )
  };

  circuitConstructionKit.register( 'CircuitConstructionKitQueryParameters', CircuitConstructionKitQueryParameters );

  return CircuitConstructionKitQueryParameters;
} );
