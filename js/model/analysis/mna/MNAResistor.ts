// Copyright 2021, University of Colorado Boulder

import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import CircuitElement from '../../CircuitElement.js';

class MNAResistor extends ModifiedNodalAnalysisCircuitElement {
  resistance: number;

  constructor( nodeId0: string, nodeId1: string, circuitElement: CircuitElement | null, resistance: number, currentSolution: number | null = null ) {
    super( nodeId0, nodeId1, circuitElement, currentSolution );
    this.resistance = resistance;
  }
}

export default MNAResistor;