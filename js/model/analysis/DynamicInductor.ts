// Copyright 2021, University of Colorado Boulder
import DynamicElementState from './DynamicElementState.js';

class DynamicInductor {
  readonly state: DynamicElementState;
  readonly inductance: number;
  readonly node0: string;
  readonly node1: string;

  constructor( node0: string, node1: string, state: DynamicElementState, inductance: number ) {
    this.state = state;
    this.inductance = inductance;
    this.node0 = node0;
    this.node1 = node1;
  }
}

export default DynamicInductor;