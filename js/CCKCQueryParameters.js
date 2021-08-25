// Copyright 2016-2021, University of Colorado Boulder

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

  // For Black Box Study & PhET-iO, selects whether to show electrons or conventional current
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

  // Whether the carousel shows real (as opposed to just ideal) light bulbs
  addRealBulbs: {
    type: 'flag',
    public: true
  },

  // Increases the number of wires that can be dragged from the toolbox
  // see https://github.com/phetsims/circuit-construction-kit-common/issues/432
  moreWires: {
    public: true,
    type: 'flag'
  },

  // Determines which standard is used to display the schematics
  schematicStandard: {
    public: true,
    type: 'string',
    defaultValue: 'ieee',
    validValues: [ 'ieee', 'iec', 'british' ]
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

  batteryMinimumResistance: {
    type: 'number',
    defaultValue: 1E-6
  },

  // Model capacitors with a series resistor to help linearize the problem
  capacitorResistance: {
    type: 'number',
    defaultValue: 1E-6
  },

  fullPrecisionAmmeter: {
    type: 'flag'
  },

  wireResistivity: {
    type: 'number',
    defaultValue: 1E-12
  },

  // Precision for the numerical matrix solution for the linear algebra step
  precision: {
    type: 'number',
    defaultValue: 32
  }
} );

circuitConstructionKitCommon.register( 'CCKCQueryParameters', CCKCQueryParameters );

export default CCKCQueryParameters;