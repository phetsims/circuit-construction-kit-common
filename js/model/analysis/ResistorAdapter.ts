// Copyright 2021, University of Colorado Boulder

import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';
import Circuit from '../Circuit.js';
import CircuitResult from './CircuitResult.js';
import CircuitElement from '../CircuitElement.js';

class ResistorAdapter extends ModifiedNodalAnalysisCircuitElement {

  /**
   * @param {Circuit} circuit
   * @param {Resistor} resistor
   * @param resistance
   */
  constructor( circuit: Circuit, resistor: CircuitElement, resistance: number ) {
    super(
      resistor.startVertexProperty.value.index + '',
      resistor.endVertexProperty.value.index + '',
      resistor,
      resistance
    );
  }

  /**
   * @param {CircuitResult} circuitResult
   * @public
   */
  applySolution( circuitResult: CircuitResult ) {
    this.circuitElement!.currentProperty.value = circuitResult.getTimeAverageCurrent( this );
  }
}

export default ResistorAdapter;