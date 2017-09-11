// Copyright 2016-2017, University of Colorado Boulder

/**
 * Base class for Ammeter and Voltmeter.  Meters for the life of the sim and hence do not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var TVector2 = require( 'DOT/TVector2' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Meter( tandem ) {

    // @public {Property.<boolean>} - indicates whether the meter is in the play area
    this.visibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    // @public {Property.<Vector2>} - the location of the body of the meter
    this.bodyPositionProperty = new Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'bodyPositionProperty' ),
      phetioValueType: TVector2
    } );

    // @public {Property.<boolean>} When the meter is dragged from the toolbox, all pieces drag together.
    this.draggingProbesWithBodyProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'draggingProbesWithBodyProperty' )
    } );

    // @public (read-only) {Emitter} Fires an event when the meter is dropped
    this.droppedEmitter = new Emitter(); // Fire event when dropped
  }

  circuitConstructionKitCommon.register( 'Meter', Meter );

  return inherit( Object, Meter, {

    /**
     * Resets the meter.  This is overriden by Ammeter and Voltmeter.
     * @public
     */
    reset: function() {
      this.visibleProperty.reset();
      this.bodyPositionProperty.reset();
      this.draggingProbesWithBodyProperty.reset();
    }
  } );
} );