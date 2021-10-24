// Copyright 2021, University of Colorado Boulder

class DynamicCircuitResistiveBattery {
  readonly voltage: number;
  resistance: number;
  readonly node0: string;
  readonly node1: string;

  constructor( node0: string, node1: string, voltage: number, resistance: number ) {
    this.node0 = node0;
    this.node1 = node1;
    this.voltage = voltage;
    this.resistance = resistance;
  }
}

export default DynamicCircuitResistiveBattery;