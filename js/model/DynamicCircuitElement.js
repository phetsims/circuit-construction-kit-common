// Copyright 2019-2020, University of Colorado Boulder

/**
 * Circuit element with time-dependent dynamics, such as an inductor or capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement from './FixedCircuitElement.js';

class DynamicCircuitElement extends FixedCircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} length
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, length, tandem, options ) {
    super( startVertex, endVertex, length, tandem, options );

    // @public {number} - value of the voltage drop set and read by the modified nodal analysis.  This is in addition
    // to the typical voltage calculation which is based on vertices.
    this.mnaVoltageDrop = 0;

    // @public {number} - value of the current set and read by the modified nodal analysis.  This is an instantaneous
    // value based on the throughput computation at the final timestep, as opposed to the currentProperty.value which
    // takes a time average across the values, so we can show transient spikes, see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
    this.mnaCurrent = 0;
  }

  /**
   * Reset the dynamic variable for the modified nodal analysis solver. This has the effect of clearing the
   * electric field (capacitor) or clearing the magnetic field (inductor)
   * @public
   */
  clear() {
    this.mnaVoltageDrop = 0;
    this.mnaCurrent = 0;
  }
}

circuitConstructionKitCommon.register( 'DynamicCircuitElement', DynamicCircuitElement );
export default DynamicCircuitElement;