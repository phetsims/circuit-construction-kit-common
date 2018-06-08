// Copyright 2016-2017, University of Colorado Boulder

/**
 * Model for the Ammeter, which adds the probe position and current readout.  There is only one ammeter per screen and
 * it is shown/hidden.  Hence it does not need a dispose() implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Meter' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // ifphetio
  var NullableIO = require( 'ifphetio!PHET_IO/types/NullableIO' );
  var NumberIO = require( 'ifphetio!PHET_IO/types/NumberIO' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Ammeter( tandem ) {

    Meter.call( this, tandem );

    // @public {Property.<number|null>} the full-precision reading on the ammeter. It will be formatted for
    // display in the view.  Null means the ammeter is not on a wire.
    this.currentProperty = new Property( null, {
      tandem: tandem.createTandem( 'currentProperty' ),
      units: 'amperes',
      phetioType: PropertyIO( NullableIO( NumberIO ) )
    } );

    // @public {Property.<Vector2>} - the position of the tip of the probe
    this.probePositionProperty = new Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'probePositionProperty' ),
      phetioType: PropertyIO( Vector2IO )
    } );
  }

  circuitConstructionKitCommon.register( 'Ammeter', Ammeter );

  return inherit( Meter, Ammeter, {

    /**
     * Restore the ammeter to its initial conditions
     * @public
     * @override
     */
    reset: function() {
      Meter.prototype.reset.call( this );
      this.currentProperty.reset();
      this.probePositionProperty.reset();
    }
  } );
} );