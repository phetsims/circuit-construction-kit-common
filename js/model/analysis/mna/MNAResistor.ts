// Copyright 2021, University of Colorado Boulder

import MNACircuitElement from './MNACircuitElement.js';

class MNAResistor extends MNACircuitElement {
  resistance: number;

  constructor( nodeId0: string, nodeId1: string, resistance: number, currentSolution: number | null = null ) {
    super( nodeId0, nodeId1, currentSolution );
    this.resistance = resistance;
  }
}

export default MNAResistor;