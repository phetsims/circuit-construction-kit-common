// Copyright 2021, University of Colorado Boulder

import CoreModel from './CoreModel.js';

class DynamicResistiveBattery extends CoreModel {
  readonly voltage: number;
  resistance: number;

  constructor( id: number, node0: string, node1: string, voltage: number, resistance: number ) {
    super( id, node0, node1 );
    this.voltage = voltage;
    this.resistance = resistance;
  }
}

export default DynamicResistiveBattery;