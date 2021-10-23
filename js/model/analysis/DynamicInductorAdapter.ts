// Copyright 2021, University of Colorado Boulder
import Inductor from '../Inductor.js';
import CircuitResult from './CircuitResult.js';
import DynamicElementState from './DynamicElementState.js';
import DynamicInductor from './DynamicInductor.js';
import DynamicCircuitInductor from './DynamicCircuitInductor.js';

class DynamicInductorAdapter extends DynamicInductor {
  private readonly inductor: Inductor;

  /**
   * @param {Inductor} inductor
   */
  constructor( inductor: Inductor ) {
    const dynamicCircuitInductor = new DynamicCircuitInductor(
      inductor.startVertexProperty.value.index + '',
      inductor.endVertexProperty.value.index + '',
      inductor.inductanceProperty.value
    );

    super( dynamicCircuitInductor, new DynamicElementState( inductor.mnaVoltageDrop, inductor.mnaCurrent ) );

    // @private - alongside this.dynamicCircuitInductor assigned in the supertype
    this.inductor = inductor;
  }

  /**
   * @param {CircuitResult} circuitResult
   * @public
   */
  applySolution( circuitResult: CircuitResult ) {


  }
}

export default DynamicInductorAdapter;