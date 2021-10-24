// Copyright 2021, University of Colorado Boulder

import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import CircuitElement from '../../CircuitElement.js';

class MNACurrent extends ModifiedNodalAnalysisCircuitElement {
  readonly current: number;

  constructor( nodeId0: string, nodeId1: string, circuitElement: CircuitElement | null, current: number, currentSolution: number | null = null ) {
    super( nodeId0, nodeId1, circuitElement, currentSolution );
    this.current = current;
  }
}

export default MNACurrent;