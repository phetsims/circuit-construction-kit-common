// Copyright 2015-2020, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement from './FixedCircuitElement.js';

class SeriesAmmeter extends FixedCircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, tandem, options ) {
    super( startVertex, endVertex, CCKCConstants.SERIES_AMMETER_LENGTH, tandem, options );

    // @public (read-only) {Property.<number>} the resistance in ohms.  A constant, but modeled as a property for
    // uniformity with other resistive elements.
    this.resistanceProperty = new NumberProperty( 0 );
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {

    // No internal parameters that can change the circuit
    return [];
  }
}

circuitConstructionKitCommon.register( 'SeriesAmmeter', SeriesAmmeter );
export default SeriesAmmeter;