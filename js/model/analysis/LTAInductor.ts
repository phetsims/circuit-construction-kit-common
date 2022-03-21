// Copyright 2021, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';

export default class LTAInductor extends DynamicCoreModel {
  readonly inductance: number;
  inductorVoltageNode1: string | null;

  constructor( id: number, node0: string, node1: string, voltage: number, current: number, inductance: number ) {
    super( id, node0, node1, voltage, current );

    assert && assert( !isNaN( inductance ), 'inductance cannot be NaN' );
    this.inductance = inductance;

    // Synthetic node to read the voltage different across the inductor part (since it is modeled in series with a resistor)
    this.inductorVoltageNode1 = null;
  }
}
// TODO: register namespace