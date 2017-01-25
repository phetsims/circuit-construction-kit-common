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

  // phet-io modules
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Meter( tandem ) {

    // @public (read-only) {Property.<boolean>} - indicates whether the meter is in the play area
    this.visibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    // @public (read-only) {Property.<Vector2>} - the location of the body of the meter
    this.bodyPositionProperty = new Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'bodyPositionProperty' ),
      phetioValueType: TVector2
    } );

    // @public (read-only) {Property.<boolean>} When the meter is dragged from the toolbox, all pieces drag together as
    // a single unit.
    this.draggingProbesWithBodyProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'draggingProbesWithBodyProperty' )
    } );

    // @public (read-only) Fires an event when the meter is dropped
    this.droppedEmitter = new Emitter(); // Fire event when dropped

    Property.preventGetSet( this, 'visible' );
    Property.preventGetSet( this, 'bodyPosition' );
    Property.preventGetSet( this, 'draggingProbesWithBody' );
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