// Copyright 2016, University of Colorado Boulder

/**
 * Base class for Ammeter and Voltmeter
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );
  var TVector2 = require( 'DOT/TVector2' );

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
    this.bodyPositionProperty = new Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'bodyPositionProperty' ),
      phetioValueType: TVector2
    } );

    // @public {Property.<boolean>} When the meter is dragged from the toolbox, all pieces drag together as
    // a single unit.
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