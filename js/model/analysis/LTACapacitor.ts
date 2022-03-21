// Copyright 2021, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

export default class LTACapacitor extends DynamicCoreModel {
  capacitorVoltageNode1: string | null;
  capacitance: number;

  constructor( id: number, node0: string, node1: string, voltage: number, current: number, capacitance: number ) {
    super( id, node0, node1, voltage, current );
    this.capacitance = capacitance;

    // Synthetic node to read the voltage different across the capacitor part (since it is modeled in series with a resistor)
    this.capacitorVoltageNode1 = null;
  }
}

circuitConstructionKitCommon.register( 'LTACapacitor', LTACapacitor );