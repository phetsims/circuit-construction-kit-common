// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  var getQueryParameter = phet.chipper.getQueryParameter;

  var CircuitConstructionKitQueryParameters = {

    // Show the voltage above each node, for debugging the circuit physics
    vertexDisplay: getQueryParameter( 'vertexDisplay' ), // 'voltage' | 'index' | undefined

    dev: !!getQueryParameter( 'dev' ),

    showPlayPauseButton: !!getQueryParameter( 'showPlayPauseButton' ),

    showSaveButton: !!getQueryParameter( 'showSaveButton' ),

    circuit: getQueryParameter( 'circuit' ),

    autosave: !!getQueryParameter( 'autosave' )
  };

  if ( CircuitConstructionKitQueryParameters.vertexDisplay ) {
    assert && assert( CircuitConstructionKitQueryParameters.vertexDisplay === 'voltage' ||
                      CircuitConstructionKitQueryParameters.vertexDisplay === 'index',
      'illegal value for vertexDisplay: ' + CircuitConstructionKitQueryParameters.vertexDisplay );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitQueryParameters', CircuitConstructionKitQueryParameters );

  return CircuitConstructionKitQueryParameters;
} );
