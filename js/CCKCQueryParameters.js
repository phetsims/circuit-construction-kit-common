// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';
import CurrentType from './model/CurrentType.js';

const CCKCQueryParameters = window.QueryStringMachine.getAll( {

  //------------------------------------------------------------------------------------------------------------------
  // Public facing
  //------------------------------------------------------------------------------------------------------------------

  // For Black Box Study & PhET-iO
  currentType: {
    public: true,
    type: 'custom',
    defaultValue: CurrentType.ELECTRONS,
    validValues: CurrentType.VALUES,
    parse: string =>
      string === 'electrons' ? CurrentType.ELECTRONS :
      string === 'conventional' ? CurrentType.CONVENTIONAL :
      string // Will error out in validValues check
  },

  // Whether the current is initially displayed
  showCurrent: {
    public: true,
    type: 'boolean',
    defaultValue: true
  },

  // Increases the number of wires that can be dragged from the toolbox
  // see https://github.com/phetsims/circuit-construction-kit-common/issues/432
  moreWires: {
    public: true,
    type: 'flag'
  },

  //------------------------------------------------------------------------------------------------------------------
  // For internal use only
  //------------------------------------------------------------------------------------------------------------------

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

  // This shows the voltmeter probe position and sampling points, useful for debugging voltmeter connectivity issues
  // or positioning if the voltmeter is rotated
  showVoltmeterSamplePoints: {
    type: 'flag'
  },

  // if any battery exceeds its current threshold, increase its resistance and run the solution again.
  // see https://github.com/phetsims/circuit-construction-kit-common/issues/245
  batteryCurrentThreshold: {
    type: 'number',
    defaultValue: 4000
  },

  // See previous comment
  batteryInternalResistanceWhenCurrentThresholdExceededOffset: {
    type: 'number',
    defaultValue: 4E-5
  },

  // See previous comment
  batteryInternalResistanceWhenCurrentThresholdExceededVoltageScaleFactor: {
    type: 'number',
    defaultValue: 2E-4
  }
} );

circuitConstructionKitCommon.register( 'CCKCQueryParameters', CCKCQueryParameters );

export default CCKCQueryParameters;