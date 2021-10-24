// Copyright 2021, University of Colorado Boulder
import DynamicElementState from './DynamicElementState.js';

class DynamicCapacitor {
  readonly state: DynamicElementState;
  readonly node0: string;
  readonly node1: string;
  capacitorVoltageNode0: string | null;
  capacitorVoltageNode1: string | null;
  capacitance: number;

  constructor( node0: string, node1: string, state: DynamicElementState, capacitance: number ) {
    this.node0 = node0;
    this.node1 = node1;
    this.state = state;
    this.capacitance = capacitance;

    // @public placeholders for where to read the capacitor part of the voltage without the series resistor
    this.capacitorVoltageNode0 = null;
    this.capacitorVoltageNode1 = null;

  }
}

export default DynamicCapacitor;