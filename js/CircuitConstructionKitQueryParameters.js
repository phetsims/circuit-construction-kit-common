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
    vertexDisplay: getQueryParameter( 'vertexDisplay' ), // 'voltage' | 'index' | undefined

    dev: !!getQueryParameter( 'dev' ),

    showPlayPauseButton: !!getQueryParameter( 'showPlayPauseButton' )
  };

  if ( CircuitConstructionKitQueryParameters.vertexDisplay ) {
    assert && assert( CircuitConstructionKitQueryParameters.vertexDisplay === 'voltage' ||
                      CircuitConstructionKitQueryParameters.vertexDisplay === 'index',
      'illegal value for vertexDisplay: ' + CircuitConstructionKitQueryParameters.vertexDisplay );
  }

  circuitConstructionKit.register( 'CircuitConstructionKitQueryParameters', CircuitConstructionKitQueryParameters );

  return CircuitConstructionKitQueryParameters;
} );
