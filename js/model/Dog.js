// Copyright 2020, University of Colorado Boulder

/**
 * The Dog is a Resistor that barks and cuts Vertex instances when the current threshold is exceeded.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );

  class Dog extends Resistor {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {
      super( startVertex, endVertex, Resistor.ResistorType.DOG, tandem, options );

      // @private - keep track of whether the dog is barking, so we can update the view accordingly
      this.isBarkingProperty = new BooleanProperty( false );

      // @private - time since last bark, to determine whether the bark has ended
      this.lastBarkTime = 0;
    }

    /**
     * @param {number} time in seconds
     * @param {number} dt in seconds
     * @param {Circuit} circuit
     * @public
     */
    step( time, dt, circuit ) {
      const current = this.currentProperty.value;
      if ( Math.abs( current ) > 0.1 ) {
        circuit.cutVertex( this.startVertexProperty.value );
        this.isBarkingProperty.value = true;
        this.lastBarkTime = time;
      }

      if ( this.isBarkingProperty.value && time - this.lastBarkTime > 0.2 ) {
        this.isBarkingProperty.value = false;
        this.lastBarkTime = 0;
      }
    }
  }

  return circuitConstructionKitCommon.register( 'Dog', Dog );
} );