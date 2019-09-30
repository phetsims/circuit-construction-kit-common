// Copyright 2019, University of Colorado Boulder

/**
 * Circuit element with time-dependent dynamics and a fixed length.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );

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

      // @public {number} - value of the current set and read by the modified nodal analysis.  This is in addition to the
      // the currentProperty.  TODO: Can we use currentProperty instead?
      this.mnaCurrent = 0;
    }
  }

  return circuitConstructionKitCommon.register( 'DynamicCircuitElement', DynamicCircuitElement );
} );