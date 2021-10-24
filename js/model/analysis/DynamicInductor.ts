// Copyright 2021, University of Colorado Boulder
import DynamicElementState from './DynamicElementState.js';
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';

class DynamicInductor {
  readonly dynamicCircuitInductor: ModifiedNodalAnalysisCircuitElement;
  readonly state: DynamicElementState;
  readonly inductance: number;

  constructor( dynamicCircuitInductor: ModifiedNodalAnalysisCircuitElement, state: DynamicElementState, inductance: number ) {

    // @public {Inductor}
    this.dynamicCircuitInductor = dynamicCircuitInductor;

    // @public {DynamicElementState}
    this.state = state;

    this.inductance = inductance;
  }
}

export default DynamicInductor;