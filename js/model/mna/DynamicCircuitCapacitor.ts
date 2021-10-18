// Copyright 2021, University of Colorado Boulder
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';

class DynamicCircuitCapacitor extends ModifiedNodalAnalysisCircuitElement {
  readonly capacitance: number;

  /**
   * @param {number} node0
   * @param {number} node1
   * @param {number} capacitance
   */
  constructor( node0: number, node1: number, capacitance: number ) {
    super( node0, node1, null, 0 );

    // @public
    this.capacitance = capacitance;
  }
}

export default DynamicCircuitCapacitor;