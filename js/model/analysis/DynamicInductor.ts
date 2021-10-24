// Copyright 2021, University of Colorado Boulder
import CoreModel from './CoreModel.js';
import DynamicElementState from './DynamicElementState.js';

class DynamicInductor extends CoreModel {
  readonly state: DynamicElementState;
  readonly inductance: number;

  constructor( id: number, node0: string, node1: string, state: DynamicElementState, inductance: number ) {
    super( id, node0, node1 );
    this.state = state;
    this.inductance = inductance;
  }
}

export default DynamicInductor;