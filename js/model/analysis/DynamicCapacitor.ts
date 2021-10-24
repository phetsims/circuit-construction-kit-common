// Copyright 2021, University of Colorado Boulder
import DynamicElementState from './DynamicElementState.js';
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';

class DynamicCapacitor {
  readonly dynamicCircuitCapacitor: ModifiedNodalAnalysisCircuitElement;
  readonly state: DynamicElementState;
  capacitorVoltageNode0: string | null;
  capacitorVoltageNode1: string | null;
  capacitance: number;

  constructor( dynamicCircuitCapacitor: ModifiedNodalAnalysisCircuitElement, state: DynamicElementState, capacitance: number ) {

    // @public {DynamicCircuit.Capacitor}
    this.dynamicCircuitCapacitor = dynamicCircuitCapacitor;

    // @public {DynamicElementState}
    this.state = state;

    // @public placeholders for where to read the capacitor part of the voltage without the series resistor
    this.capacitorVoltageNode0 = null;
    this.capacitorVoltageNode1 = null;
    this.capacitance = capacitance;
  }
}

export default DynamicCapacitor;