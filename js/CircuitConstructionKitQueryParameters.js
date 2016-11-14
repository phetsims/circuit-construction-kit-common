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

  var CircuitConstructionKitQueryParameters = QueryStringMachine.getAll( {

    // Show the voltage above each node, for debugging the circuit physics
    vertexDisplay: {
      type: 'string',
      defaultValue: undefined,
      validValues: [ undefined, 'voltage', 'index' ]
    },

    //TODO document
    showPlayPauseButton: { type: 'flag' },

    //TODO document
    showSaveButton: { type: 'flag' },

    //TODO document
    circuit: { type: 'flag' },

    //TODO document
    autosave: { type: 'flag' }
  } );

  circuitConstructionKitCommon.register( 'CircuitConstructionKitQueryParameters', CircuitConstructionKitQueryParameters );

  return CircuitConstructionKitQueryParameters;
} );
