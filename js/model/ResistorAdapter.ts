// Copyright 2016-2021, University of Colorado Boulder

import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import CCKCConstants from '../CCKCConstants.js';
import Circuit from './Circuit.js';
import Resistor from './Resistor.js';
import CircuitResult from './CircuitResult.js';

class ResistorAdapter extends ModifiedNodalAnalysisCircuitElement {
  private readonly resistor: Resistor;

  /**
   * @param {Circuit} circuit
   * @param {Resistor} resistor
   */
  constructor( circuit: Circuit, resistor: Resistor ) {
    super(
      resistor.startVertexProperty.value.index,
      resistor.endVertexProperty.value.index,
      resistor,

      // If a resistor goes to 0 resistance, then we cannot compute the current through as I=V/R.  Therefore,
      // simulate a small amount of resistance.
      resistor.resistanceProperty.value || CCKCConstants.MINIMUM_RESISTANCE
    );

    // @private
    this.resistor = resistor;
  }

  /**
   * @param {CircuitResult} circuitResult
   * @public
   */
  applySolution( circuitResult: CircuitResult ) {
    this.resistor.currentProperty.value = circuitResult.getTimeAverageCurrent( this );
  }
}

export default ResistorAdapter;