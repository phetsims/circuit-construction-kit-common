// Copyright 2016-2020, University of Colorado Boulder

/**
 * Base class for Ammeter and Voltmeter.  Meters for the life of the sim and hence do not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class Meter {

  /**
   * @param {Tandem} tandem
   * @param {number} phetioIndex - for assigning corresponding tandems
   */
  constructor( tandem, phetioIndex ) {

    // @public (read-only) {number}
    this.phetioIndex = phetioIndex;

    // @public {Property.<boolean>} - indicates whether the meter is in the play area
    this.visibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    // @public - the position of the body of the meter
    this.bodyPositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'bodyPositionProperty' )
    } );

    // @public {Property.<boolean>} When the meter is dragged from the toolbox, all pieces drag together.
    this.draggingProbesWithBodyProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'draggingProbesWithBodyProperty' )
    } );

    // @public (read-only) {Emitter} Fires an event when the meter is dropped
    this.droppedEmitter = new Emitter( { parameters: [ { valueType: Bounds2 } ] } );
  }

  /**
   * Resets the meter.  This is overridden by Ammeter and Voltmeter.
   * @public
   */
  reset() {
    this.visibleProperty.reset();
    this.bodyPositionProperty.reset();
    this.draggingProbesWithBodyProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Meter', Meter );
export default Meter;
