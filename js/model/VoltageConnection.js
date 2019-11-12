// Copyright 2019, University of Colorado Boulder

/**
 * Indicates a vertex and a voltage measurement at the given vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

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

  return circuitConstructionKitCommon.register( 'VoltageConnection', VoltageConnection );
} );