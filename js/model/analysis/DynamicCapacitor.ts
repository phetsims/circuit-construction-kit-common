// Copyright 2021, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';

class DynamicCapacitor extends DynamicCoreModel {
  capacitorVoltageNode0: string | null;
  capacitorVoltageNode1: string | null;
  capacitance: number;

  constructor( id: number, node0: string, node1: string, voltage: number, current: number, capacitance: number ) {
    super( id, node0, node1, voltage, current );
    this.capacitance = capacitance;

    // @public placeholders for where to read the capacitor part of the voltage without the series resistor
    this.capacitorVoltageNode0 = null;
    this.capacitorVoltageNode1 = null;
  }
}

export default DynamicCapacitor;