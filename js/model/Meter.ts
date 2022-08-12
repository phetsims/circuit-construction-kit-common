// Copyright 2016-2022, University of Colorado Boulder

/**
 * Base class for Ammeter and Voltmeter.  Meters for the life of the sim and hence do not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class Meter {
  public phetioIndex: number;

  // indicates whether the meter is in the play area
  public readonly visibleProperty: Property<boolean>;

  // the position of the body of the meter
  public readonly bodyPositionProperty: Property<Vector2>;

  // When the meter is dragged from the toolbox, all pieces drag together.
  public readonly draggingProbesWithBodyProperty: BooleanProperty;

  // Fires an event when the meter is dropped
  public readonly droppedEmitter: TEmitter<[ Bounds2 ]>;

  /**
   * @param tandem
   * @param phetioIndex - for assigning corresponding tandems
   */
  public constructor( tandem: Tandem, phetioIndex: number ) {

    this.phetioIndex = phetioIndex;
    this.visibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    this.bodyPositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'bodyPositionProperty' )
    } );

    this.draggingProbesWithBodyProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'draggingProbesWithBodyProperty' )
    } );

    this.droppedEmitter = new Emitter( { parameters: [ { valueType: Bounds2 } ] } );
  }

  /**
   * Resets the meter.  This is overridden by Ammeter and Voltmeter.
   */
  public reset(): void {
    this.visibleProperty.reset();
    this.bodyPositionProperty.reset();
    this.draggingProbesWithBodyProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Meter', Meter );