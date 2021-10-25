// Copyright 2021, University of Colorado Boulder
import DynamicCoreModel from './DynamicCoreModel.js';

class LTAInductor extends DynamicCoreModel {
  readonly inductance: number;

  constructor( id: number, node0: string, node1: string, voltage: number, current: number, inductance: number ) {
    super( id, node0, node1, voltage, current );
    this.inductance = inductance;
  }
}

export default LTAInductor;