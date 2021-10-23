// Copyright 2021, University of Colorado Boulder
import DynamicCircuitCapacitor from './DynamicCircuitCapacitor.js';
import DynamicElementState from './DynamicElementState.js';

class DynamicCapacitor {
  readonly dynamicCircuitCapacitor: DynamicCircuitCapacitor;
  readonly state: DynamicElementState;
  capacitorVoltageNode0: string | null;
  capacitorVoltageNode1: string | null;

  /**
   * @param {DynamicCircuit.Capacitor} dynamicCircuitCapacitor
   * @param {DynamicElementState} state
   */
  constructor( dynamicCircuitCapacitor: DynamicCircuitCapacitor, state: DynamicElementState ) {

    // @public {DynamicCircuit.Capacitor}
    this.dynamicCircuitCapacitor = dynamicCircuitCapacitor;

    // @public {DynamicElementState}
    this.state = state;

    // @public placeholders for where to read the capacitor part of the voltage without the series resistor
    this.capacitorVoltageNode0 = null;
    this.capacitorVoltageNode1 = null;
  }
}

export default DynamicCapacitor;