// Copyright 2021, University of Colorado Boulder
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';

class DynamicCircuitCapacitor extends ModifiedNodalAnalysisCircuitElement {
  readonly capacitance: number;

  /**
   * @param {string} node0
   * @param {string} node1
   * @param {number} capacitance
   */
  constructor( node0: string, node1: string, capacitance: number ) {
    super( node0, node1, null, 0 );

    // @public
    this.capacitance = capacitance;
  }
}

export default DynamicCircuitCapacitor;