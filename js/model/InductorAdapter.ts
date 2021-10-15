import DynamicCircuit from './DynamicCircuit.js';
import CCKCUtils from '../CCKCUtils.js';
import Inductor from './Inductor.js';
import Circuit from './Circuit.js';
import CircuitResult from './CircuitResult.js';
import DynamicElementState from './DynamicElementState.js';
import DynamicInductor from './DynamicInductor.js';
import DynamicCircuitInductor from './DynamicCircuitInductor.js';

class InductorAdapter extends DynamicInductor {
  inductor: Inductor;

  /**
   * @param {Circuit} circuit
   * @param {Inductor} inductor
   */
  constructor( circuit: Circuit, inductor: Inductor ) {
    const dynamicCircuitInductor = new DynamicCircuitInductor(
      inductor.startVertexProperty.value.index,
      inductor.endVertexProperty.value.index,
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
    this.inductor.currentProperty.value = -circuitResult.getTimeAverageCurrent( this.dynamicCircuitInductor );
    this.inductor.mnaCurrent = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousCurrent( this.dynamicCircuitInductor ) );
    this.inductor.mnaVoltageDrop = CCKCUtils.clampMagnitude( circuitResult.getInstantaneousVoltage( this.dynamicCircuitInductor ) );
    assert && assert( Math.abs( this.inductor.mnaCurrent ) < 1E100, 'mnaCurrent out of range' );
    assert && assert( Math.abs( this.inductor.mnaVoltageDrop ) < 1E100, 'mnaVoltageDrop out of range' );
  }
}

export default InductorAdapter;