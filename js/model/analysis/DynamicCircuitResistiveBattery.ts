// Copyright 2021, University of Colorado Boulder
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';

class DynamicCircuitResistiveBattery extends ModifiedNodalAnalysisCircuitElement {
  readonly voltage: number;
  resistance: number;

  /**
   * @param {string} node0
   * @param {string} node1
   * @param {number} voltage
   * @param {number} resistance
   */
  constructor( node0: string, node1: string, voltage: number, resistance: number ) {
    super( node0, node1, null, 0 );

    // @public
    this.voltage = voltage;

    // @public
    this.resistance = resistance;
  }
}

export default DynamicCircuitResistiveBattery;