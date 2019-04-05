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
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );

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
        currentRating: 4,
        isCurrentReentrant: true // Changing the current can trip a fuse, which changes the current
      }, options );

      super( startVertex, endVertex, options.resistorLength, tandem, options );

      // @public {Property.<number>} the current at which the fuse trips, in amps
      this.currentRatingProperty = new NumberProperty( options.currentRating, {
        isValidValue: v => v >= 0,
        range: new Range( 0, 20 )
      } );

      // @public - true if the fuse is tripped
      this.isTrippedProperty = new BooleanProperty( false );

      // @public {Property.<number>} the resistance in ohms
      this.resistanceProperty = new DerivedProperty( [ this.isTrippedProperty ],
        isTripped => isTripped ? CCKCConstants.MAX_RESISTANCE : CCKCConstants.MINIMUM_RESISTANCE
      );

      // @public (read-only) Used in CircuitElementEditNode
      this.numberOfDecimalPlaces = 1;
    }

    /**
     * Reset the fuse so it is no longer tripped.
     * @public
     */
    resetFuse() {
      this.isTrippedProperty.reset();
    }

    /**
     * @param {number} time - total elapsed time
     * @param {number} dt - delta between last frame and current frame
     * @public
     */
    step( time, dt ) {

      // When the current exceeds the max, trip the fuse.  This cannot be modeled as a property link because it
      // creates a reentrant property loop which doesn't update the reset fuse button properly
      if ( Math.abs( this.currentProperty.value ) > this.currentRatingProperty.value ) {
        this.isTrippedProperty.value = true;
      }
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      return [ this.resistanceProperty,

        // update the circuit when the fuse is reset
        this.isTrippedProperty ];
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
        currentRating: this.currentRatingProperty.value,
        resistorLength: this.chargePathLength
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'Fuse', Fuse );
} );