// Copyright 2020, University of Colorado Boulder

/**
 * The Dog is a Resistor that barks and cuts Vertex instances when the current threshold is exceeded.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Resistor from './Resistor.js';

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

    const BARK_TIME = 0.5;
    if ( this.isBarkingProperty.value && time - this.lastBarkTime > BARK_TIME ) {
      this.isBarkingProperty.value = false;
      this.lastBarkTime = 0;
    }
  }
}

circuitConstructionKitCommon.register( 'Dog', Dog );
export default Dog;