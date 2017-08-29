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

  var CircuitConstructionKitCommonQueryParameters = window.QueryStringMachine.getAll( {

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

    // Shows the play/pause button.  When the user changes something, the sim automatically pauses.
    // For Black Box Study & PhET-iO
    showPlayPauseButton: { type: 'flag' },

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
        //REVIEW: More of a question of how this works: Is validValues checked after the parsing (in which case I guess
        //REVIEW: it sees the Error object... but it won't throw the error object?). Why not throw, and not specify
        //REVIEW: validValues?
        //REVIEW^(samreid): ValidValues is checked after parsing, it will see the error and see that error is not on the
        //REVIEW^(samreid): on the whitelist.  So running with ?currentType=hello you get this error:
        //REVIEW^(samreid): Error for query parameter "currentType": value must be a member of validValues: Error: invalid value: hello
        //REVIEW^(samreid): validValues has worked well elsewhere, so I used that pattern here as well.  But I think
        //REVIEW^(samreid): it was confusing to have an error reporting another error, so I changed this to use the string
        //REVIEW^(samreid): Now the error reads like Error for query parameter "currentType": value must be a member of validValues: hello
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
    'CircuitConstructionKitCommonQueryParameters',
    CircuitConstructionKitCommonQueryParameters
  );

  return CircuitConstructionKitCommonQueryParameters;
} );