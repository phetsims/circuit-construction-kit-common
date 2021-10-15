// Copyright 2020-2021, University of Colorado Boulder

/**
 * The Dog is a Resistor that barks and cuts Vertex instances when the current threshold is exceeded.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import Resistor, {ResistorOptions} from './Resistor.js';
import Vertex from './Vertex.js';

class Dog extends Resistor {
  private readonly isBarkingProperty: BooleanProperty;
  private lastBarkTime: number;
  private triggerCount: number;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, options?: ResistorOptions ) {
    super( startVertex, endVertex, Resistor.ResistorType.DOG, tandem, options );

    // @private - keep track of whether the dog is barking, so we can update the view accordingly
    this.isBarkingProperty = new BooleanProperty( false );

    // @private - time since last bark, to determine whether the bark has ended
    this.lastBarkTime = 0;

    // @private - When connecting a voltage source (without completing the circuit), there is one frame where there is an unbalanced
    // voltage.  We need to wait until the next frame to see if the voltage difference is sustained.
    this.triggerCount = 0;
  }

  /**
   * @param {number} time in seconds
   * @param {number} dt in seconds
   * @param {Circuit} circuit
   * @public
   */
  step( time: number, dt: number, circuit: Circuit ) {
    super.step( time, dt, circuit );
    const voltage = this.voltageDifferenceProperty.value;

    // When connecting a voltage source (without completing the circuit), there is one frame where there is an unbalanced
    // voltage.  We need to wait until the next frame to see if the voltage difference is sustained.
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/649#issuecomment-758671266
    if ( Math.abs( voltage ) > 100 ) {
      this.triggerCount++;
    }
    else {
      this.triggerCount = 0;
    }

    if ( this.triggerCount >= 2 ) {
      circuit.cutVertex( this.startVertexProperty.value );
      this.isBarkingProperty.value = true;
      this.lastBarkTime = time;
      this.triggerCount = 0;
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