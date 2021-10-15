// Copyright 2016-2021, University of Colorado Boulder
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';

class DynamicCircuitResistiveBattery extends ModifiedNodalAnalysisCircuitElement {
  readonly voltage: number;
  resistance: number;

  /**
   * @param {number} node0
   * @param {number} node1
   * @param {number} voltage
   * @param {number} resistance
   */
  constructor( node0: number, node1: number, voltage: number, resistance: number ) {
    super( node0, node1, null, 0 );

    // @public
    this.voltage = voltage;

    // @public
    this.resistance = resistance;
  }
}

export default DynamicCircuitResistiveBattery;