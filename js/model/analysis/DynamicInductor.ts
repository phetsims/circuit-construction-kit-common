// Copyright 2021, University of Colorado Boulder
import DynamicCircuitInductor from './DynamicCircuitInductor.js';
import DynamicElementState from './DynamicElementState.js';

class DynamicInductor {
  readonly dynamicCircuitInductor: DynamicCircuitInductor;
  readonly state: DynamicElementState;

  /**
   * @param {DynamicCircuitInductor} dynamicCircuitInductor
   * @param {DynamicElementState} state
   */
  constructor( dynamicCircuitInductor: DynamicCircuitInductor, state: DynamicElementState ) {

    // @public {Inductor}
    this.dynamicCircuitInductor = dynamicCircuitInductor;

    // @public {DynamicElementState}
    this.state = state;
  }
}

export default DynamicInductor;