// Copyright 2021, University of Colorado Boulder
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';

class DynamicCircuitInductor extends ModifiedNodalAnalysisCircuitElement {
  readonly inductance: number;

  /**
   * @param {number} node0
   * @param {number} node1
   * @param {number} inductance
   */
  constructor( node0: string, node1: string, inductance: number ) {
    super( node0, node1, null, 0 );

    // @public
    this.inductance = inductance;
  }
}

export default DynamicCircuitInductor;