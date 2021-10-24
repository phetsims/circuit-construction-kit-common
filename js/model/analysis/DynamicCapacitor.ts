// Copyright 2021, University of Colorado Boulder
import CoreModel from './CoreModel.js';
import DynamicElementState from './DynamicElementState.js';

class DynamicCapacitor extends CoreModel {
  readonly state: DynamicElementState;
  capacitorVoltageNode0: string | null;
  capacitorVoltageNode1: string | null;
  capacitance: number;

  constructor( id: number, node0: string, node1: string, state: DynamicElementState, capacitance: number ) {
    super( id, node0, node1 );
    this.state = state;
    this.capacitance = capacitance;

    // @public placeholders for where to read the capacitor part of the voltage without the series resistor
    this.capacitorVoltageNode0 = null;
    this.capacitorVoltageNode1 = null;
  }
}

export default DynamicCapacitor;