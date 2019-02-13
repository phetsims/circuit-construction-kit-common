// Copyright 2015-2019, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const Property = require( 'AXON/Property' );

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
      this.resistanceProperty = new Property( 0 );
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

  return circuitConstructionKitCommon.register( 'SeriesAmmeter', SeriesAmmeter );
} );