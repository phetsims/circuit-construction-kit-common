// Copyright 2016-2019, University of Colorado Boulder

/**
 * Model for the Ammeter, which adds the probe position and current readout.  There is only one ammeter per screen and
 * it is shown/hidden.  Hence it does not need a dispose() implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Meter' );
  const NullableIO = require( 'TANDEM/types/NullableIO' );
  const NumberIO = require( 'TANDEM/types/NumberIO' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class Ammeter extends Meter {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {
      super( tandem );

      // @public {Property.<number|null>} the full-precision reading on the ammeter. It will be formatted for
      // display in the view.  Null means the ammeter is not on a wire.
      this.currentProperty = new Property( null, {
        tandem: tandem.createTandem( 'currentProperty' ),
        units: 'amperes',
        phetioType: PropertyIO( NullableIO( NumberIO ) )
      } );

      // @public {Property.<Vector2>} - the position of the tip of the probe
      this.probePositionProperty = new Vector2Property( Vector2.ZERO, {
        tandem: tandem.createTandem( 'probePositionProperty' )
      } );
    }

    /**
     * Restore the ammeter to its initial conditions
     * @public
     * @override
     */
    reset() {
      super.reset();
      this.currentProperty.reset();
      this.probePositionProperty.reset();
    }
  }

  return circuitConstructionKitCommon.register( 'Ammeter', Ammeter );
} );