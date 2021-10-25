// Copyright 2021, University of Colorado Boulder

import MNACircuitElement from './MNACircuitElement.js';
import CircuitElement from '../../CircuitElement.js';

class MNAResistor extends MNACircuitElement {
  resistance: number;

  constructor( nodeId0: string, nodeId1: string, circuitElement: CircuitElement | null, resistance: number, currentSolution: number | null = null ) {
    super( nodeId0, nodeId1, circuitElement, currentSolution );
    this.resistance = resistance;
  }
}

export default MNAResistor;