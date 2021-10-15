import DynamicCircuitCapacitor from './DynamicCircuitCapacitor.js';
import DynamicElementState from './DynamicElementState.js';

class DynamicCapacitor {
  dynamicCircuitCapacitor: DynamicCircuitCapacitor;
  state: DynamicElementState;
  capacitorVoltageNode0: number | null;
  capacitorVoltageNode1: number | null;

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