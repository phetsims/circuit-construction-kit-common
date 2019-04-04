// Copyright 2019, University of Colorado Boulder

/**
 * Model for a fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );

  // constants
  const RESISTOR_LENGTH = CCKCConstants.RESISTOR_LENGTH;

  class Fuse extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {
      options = _.extend( {
        resistance: CCKCConstants.MINIMUM_RESISTANCE,
        resistorLength: RESISTOR_LENGTH,
        isFlammable: false,
        maxCurrent: 4,
        isCurrentReentrant: true // Changing the current can trip a fuse, which changes the current
      }, options );

      super( startVertex, endVertex, options.resistorLength, tandem, options );

      // @public {Property.<number>} the resistance in ohms
      this.resistanceProperty = new NumberProperty( options.resistance );

      // @public {Property.<number>} the current at which the fuse trips, in amps
      this.maxCurrentProperty = new NumberProperty( options.maxCurrent );

      this.isTrippedProperty = new BooleanProperty( false );

      // When the current exceeds the max, trip the fuse
      Property.multilink( [ this.currentProperty, this.maxCurrentProperty ], ( current, maxCurrent ) => {
        if ( Math.abs( current ) > maxCurrent ) {
          this.isTrippedProperty.value = true;
          this.resistanceProperty.value = CCKCConstants.MAX_RESISTANCE;
        }
      } );
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      return [ this.resistanceProperty ];
    }

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      const parent = super.toIntrinsicStateObject();
      return _.extend( parent, {
        resistance: this.resistanceProperty.value,
        maxCurrent: this.maxCurrentProperty.value,
        resistorLength: this.chargePathLength
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'Fuse', Fuse );
} );