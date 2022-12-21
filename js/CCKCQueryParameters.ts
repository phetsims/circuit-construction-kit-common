// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';

const CCKCQueryParameters = QueryStringMachine.getAll( {

  //------------------------------------------------------------------------------------------------------------------
  // Public facing
  //------------------------------------------------------------------------------------------------------------------

  // For Black Box Study & PhET-iO, selects whether to show electrons or conventional current
  currentType: {
    public: true,
    type: 'string',
    defaultValue: 'electrons',
    validValues: [ 'electrons', 'conventional' ]
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

  // Increases the number of inductors that can be dragged from the toolbox
  // see https://github.com/phetsims/circuit-construction-kit-common/issues/774
  moreInductors: {
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

  ammeterReadout: {
    public: true,
    type: 'string',
    defaultValue: 'magnitude',
    validValues: [ 'magnitude', 'signed' ]
  },

  //------------------------------------------------------------------------------------------------------------------
  // For internal use only
  //------------------------------------------------------------------------------------------------------------------

  // Show a readout for each vertex, for debugging the circuit physics
  vertexDisplay: {
    type: 'flag'
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
    defaultValue: 1E-4
  },

  // Model capacitors with a series resistor to help linearize the problem
  capacitorResistance: {
    type: 'number',
    defaultValue: 1E-4
  },

  // Model inductors with a series resistor to help linearize the problem
  inductorResistance: {
    type: 'number',
    defaultValue: 1E-4
  },

  fullPrecisionAmmeter: {
    type: 'flag'
  },

  wireResistivity: {
    type: 'number',
    defaultValue: 1E-10
  },

  // For debugging the current value and sense of FixedCircuitElement
  showCurrents: {
    type: 'flag'
  },

  inductanceMin: {
    type: 'number',
    defaultValue: 0.1
  },
  inductanceMax: {
    type: 'number',
    defaultValue: 10
  },
  inductanceStep: {
    type: 'number',
    defaultValue: 0.001
  },
  inductanceDefault: {
    type: 'number',
    defaultValue: 5
  },
  inductorNumberDecimalPlaces: {
    type: 'number',
    defaultValue: 3
  },

  capacitanceMin: {
    type: 'number',
    defaultValue: 0.05
  },
  capacitanceMax: {
    type: 'number',
    defaultValue: 0.2
  },
  capacitanceStep: {
    type: 'number',
    defaultValue: 0.01
  },
  capacitanceDefault: {
    type: 'number',
    defaultValue: 0.1
  },
  capacitorNumberDecimalPlaces: {
    type: 'number',
    defaultValue: 2
  },

  minDT: {
    type: 'number',
    defaultValue: 1E-3
  },
  searchTimeStep: {
    type: 'boolean',
    defaultValue: true
  },

  codap: {
    type: 'flag'
  }
} );

circuitConstructionKitCommon.register( 'CCKCQueryParameters', CCKCQueryParameters );

export default CCKCQueryParameters;