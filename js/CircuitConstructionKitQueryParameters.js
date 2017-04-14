// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  var CircuitConstructionKitQueryParameters = window.QueryStringMachine.getAll( {

    // Show a readout for each vertex, for debugging the circuit physics
    vertexDisplay: {
      type: 'string',
      defaultValue: null,
      validValues: [
        null, // Show nothing
        'voltage', // Show the voltage
        'index' // Show the vertex index
      ]
    },

    // Shows the play/pause button.  When the user changes something, the sim automatically pauses.
    showPlayPauseButton: { type: 'flag' },

    // Shows a button that saves the circuit
    showSaveButton: { type: 'flag' },

    // The circuit, as a LZW-compressed string
    circuit: {
      type: 'string',
      defaultValue: null
    },

    showControlPanel: {
      type: 'boolean',
      defaultValue: true
    },

    showElectronsCheckBox: {
      type: 'boolean',
      defaultValue: true
    },

    // TODO: this needs to match new UI for show charges
    showElectrons: {
      type: 'boolean',
      defaultValue: true
    }
  } );

  circuitConstructionKitCommon.register( 'CircuitConstructionKitQueryParameters', CircuitConstructionKitQueryParameters );

  return CircuitConstructionKitQueryParameters;
} );