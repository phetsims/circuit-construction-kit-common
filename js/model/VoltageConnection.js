// Copyright 2019-2020, University of Colorado Boulder

/**
 * Indicates a vertex and a voltage measurement at the given vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class VoltageConnection {

  /**
   * @param {Vertex} vertex
   * @param {number} [voltage]
   */
  constructor( vertex, voltage = vertex.voltageProperty.value ) {

    // @public
    this.vertex = vertex;

    // @public
    this.voltage = voltage;
  }
}

circuitConstructionKitCommon.register( 'VoltageConnection', VoltageConnection );
export default VoltageConnection;