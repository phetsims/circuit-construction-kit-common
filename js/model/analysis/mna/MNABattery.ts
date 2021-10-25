// Copyright 2021, University of Colorado Boulder

import MNACircuitElement from './MNACircuitElement.js';
import CircuitElement from '../../CircuitElement.js';

class MNABattery extends MNACircuitElement {
  readonly voltage: number;

  constructor( nodeId0: string, nodeId1: string, circuitElement: CircuitElement | null, voltage: number, currentSolution: number | null = null ) {
    super( nodeId0, nodeId1, circuitElement, currentSolution );
    this.voltage = voltage;
  }
}

export default MNABattery;