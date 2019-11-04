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
  const DynamicCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuitElement' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );

  // constants
  const INDUCTOR_LENGTH = CCKCConstants.INDUCTOR_LENGTH;

  class Inductor extends DynamicCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {
      options = merge( {
        inductance: 50,
        numberOfDecimalPlaces: 0,
        editorDelta: 1
      }, options );

      super( startVertex, endVertex, INDUCTOR_LENGTH, tandem, options );

      // @public {Property.<number>} the inductance in Henries
      this.inductanceProperty = new NumberProperty( options.inductance, {
        range: new Range( 10, 100 ),
        tandem: tandem.createTandem( 'inductanceProperty' )
      } );
    }

    /**
     * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
     * @public
     */
    dispose() {
      this.inductanceProperty.dispose();
      super.dispose();
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
  }

  return circuitConstructionKitCommon.register( 'Inductor', Inductor );
} );