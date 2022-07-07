// Copyright 2021-2022, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

export default class LTACapacitor extends DynamicCoreModel {
  public capacitorVoltageNode1: string | null;
  public capacitance: number;

  public constructor( id: number, node0: string, node1: string, voltage: number, current: number, capacitance: number ) {
    super( id, node0, node1, voltage, current );
    this.capacitance = capacitance;

    // Synthetic node to read the voltage different across the capacitor part (since it is modeled in series with a resistor)
    this.capacitorVoltageNode1 = null;
  }
}

circuitConstructionKitCommon.register( 'LTACapacitor', LTACapacitor );