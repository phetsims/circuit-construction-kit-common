import DynamicCircuitInductor from "./DynamicCircuitInductor";
import DynamicElementState from "./DynamicElementState";

class DynamicInductor {
  dynamicCircuitInductor: DynamicCircuitInductor;
  state: DynamicElementState;

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