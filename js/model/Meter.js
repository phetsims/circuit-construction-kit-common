// Copyright 2016-2019, University of Colorado Boulder

/**
 * Base class for Ammeter and Voltmeter.  Meters for the life of the sim and hence do not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Emitter = require( 'AXON/Emitter' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

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

      // @public - the location of the body of the meter
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
     * Resets the meter.  This is overriden by Ammeter and Voltmeter.
     * @public
     */
    reset() {
      this.visibleProperty.reset();
      this.bodyPositionProperty.reset();
      this.draggingProbesWithBodyProperty.reset();
    }
  }

  return circuitConstructionKitCommon.register( 'Meter', Meter );
} );