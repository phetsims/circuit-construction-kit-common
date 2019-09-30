// Copyright 2016-2019, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CurrentType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CurrentType' );

  const CCKCQueryParameters = window.QueryStringMachine.getAll( {

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
      parse: string =>
        string === 'electrons' ? CurrentType.ELECTRONS :
        string === 'conventional' ? CurrentType.CONVENTIONAL :
        string // Will error out in validValues check
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
    },

    // Increases the number of wires that can be dragged from the toolbox
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/432
    moreWires: {
      type: 'flag'
    },

    batteryCurrentThreshold: {
      type: 'number',
      defaultValue: Number.POSITIVE_INFINITY
    },

    batteryInternalResistanceWhenCurrentThresholdExceeded: {
      type: 'number',
      defaultValue: 0
    }
  } );

  circuitConstructionKitCommon.register( 'CCKCQueryParameters', CCKCQueryParameters );

  return CCKCQueryParameters;
} );