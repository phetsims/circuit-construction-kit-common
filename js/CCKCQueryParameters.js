// Copyright 2016-2017, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CurrentType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CurrentType' );

  var CCKCQueryParameters = window.QueryStringMachine.getAll( {

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

    // Output debugging information to the console during the Modified Nodal Analysis
    debugModifiedNodalAnalysis: { type: 'flag' },

    // Shows the play/pause button.  When the user changes something, the sim automatically pauses and hides indicators (like electrons and flame)
    // For Black Box Study & PhET-iO
    showDepictValuesToggleButton: { type: 'flag' },

    // Shows a button that saves the circuit
    // For Black Box Study & PhET-iO
    showSaveButton: { type: 'flag' },

    // The circuit, as a LZW-compressed string
    // For Black Box Study & PhET-iO
    circuit: {
      type: 'string',
      defaultValue: null
    },

    // For Black Box Study & PhET-iO
    showDisplayOptionsPanel: {
      type: 'boolean',
      defaultValue: true
    },

    // For Black Box Study & PhET-iO
    currentType: {
      type: 'custom',
      defaultValue: CurrentType.ELECTRONS,
      validValues: CurrentType.VALUES,
      parse: function( string ) {
        return string === 'electrons' ? CurrentType.ELECTRONS :
               string === 'conventional' ? CurrentType.CONVENTIONAL :
               string; // Will error out in validValues check
      }
    },

    // For Black Box Study & PhET-iO
    showCurrent: {
      type: 'boolean',
      defaultValue: true
    },

    // This shows the voltmeter probe position and sampling points, useful for debugging voltmeter connectivity issues
    // or positioning if the voltmeter is rotated
    showVoltmeterSamplePoints: {
      type: 'flag'
    }
  } );

  circuitConstructionKitCommon.register(
    'CCKCQueryParameters',
    CCKCQueryParameters
  );

  return CCKCQueryParameters;
} );