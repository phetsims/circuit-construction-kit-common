// Copyright 2019-2021, University of Colorado Boulder

/**
 * Circuit element with time-dependent dynamics, such as an inductor or capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, {FixedCircuitElementOptions} from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

type DynamicCircuitElementOptions = {} & FixedCircuitElementOptions;

// This class should not be instantiated directly, instead subclasses should provide implementations for getCircuitProperties
// and the subclasses should be used instead.
abstract class DynamicCircuitElement extends FixedCircuitElement {
  mnaVoltageDrop: number;
  mnaCurrent: number;
  readonly clearEmitter: Emitter<[]>;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} length
   * @param {Tandem} tandem
   * @param {Object} [options]
   */

  // @ts-ignore options
  constructor( startVertex: Vertex, endVertex: Vertex, length: number, tandem: Tandem, options: object ) {
    super( startVertex, endVertex, length, tandem, options );

    // @public {number} - value of the voltage drop set and read by the modified nodal analysis.  This is in addition
    // to the typical voltage calculation which is based on vertices.
    this.mnaVoltageDrop = 0;

    // @public {number} - value of the current set and read by the modified nodal analysis.  This is an instantaneous
    // value based on the throughput computation at the final timestep, as opposed to the currentProperty.value which
    // takes a time average across the values, so we can show transient spikes,
    // see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
    this.mnaCurrent = 0;

    // @public (listen-only)
    this.clearEmitter = new Emitter();
  }

  /**
   * Reset the dynamic variable for the modified nodal analysis solver. This has the effect of clearing the
   * electric field (capacitor) or clearing the magnetic field (inductor)
   * @public
   */
  clear() {
    this.mnaVoltageDrop = 0;
    this.mnaCurrent = 0;
    this.clearEmitter.emit();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.clearEmitter.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'DynamicCircuitElement', DynamicCircuitElement );
export {DynamicCircuitElementOptions};
export default DynamicCircuitElement;