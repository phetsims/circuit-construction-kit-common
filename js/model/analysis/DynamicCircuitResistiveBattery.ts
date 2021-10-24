// Copyright 2021, University of Colorado Boulder
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';

class DynamicCircuitResistiveBattery extends ModifiedNodalAnalysisCircuitElement {
  readonly voltage: number;
  resistance: number;

  constructor( node0: string, node1: string, voltage: number, resistance: number ) {
    super( node0, node1, null, 0 );
    this.voltage = voltage;
    this.resistance = resistance;
  }
}

export default DynamicCircuitResistiveBattery;