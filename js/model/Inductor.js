// Copyright 2019, University of Colorado Boulder

/**
 * Model for an inductor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );

  // constants
  const INDUCTOR_LENGTH = CCKCConstants.INDUCTOR_LENGTH;

  class Inductor extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {
      options = _.extend( {
        inductance: 50
      }, options );

      super( startVertex, endVertex, INDUCTOR_LENGTH, tandem, options );

      // @public {Property.<number>} the inductance in Henries
      this.inductanceProperty = new NumberProperty( options.inductance, {
        range: new Range( 10, 100 )
      } );

      // TODO: factor out to a parent type for Inductor and Inductor
      this.mnaVoltageDrop = 0;
      this.mnaCurrent = 0;

      // TODO: move this to parent circuit element type
      this.numberOfDecimalPlaces = 0;
      this.editorDelta = 1;
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      return [ this.inductanceProperty ];
    }

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      const parent = super.toIntrinsicStateObject();
      return _.extend( parent, {
        inductance: this.inductanceProperty.value
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'Inductor', Inductor );
} );