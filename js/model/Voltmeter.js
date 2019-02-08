// Copyright 2016-2017, University of Colorado Boulder

/**
 * The model for a voltmeter, which has a red and black probe and reads out voltage between vertices/wires. Exists
 * for the life of the sim and hence a dispose implementation is not needed.
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
  const Vector2IO = require( 'DOT/Vector2IO' );

  class Voltmeter extends Meter {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {
      super( tandem );

      // @public {Property.<number|null>} the voltage the probe is reading (in volts) or null if unconnected
      this.voltageProperty = new Property( null, {
        tandem: tandem.createTandem( 'voltageProperty' ),
        units: 'volts',
        phetioType: PropertyIO( NullableIO( NumberIO ) )
      } );

      // @public {Property.<Vector2>} - the position of the tip of the red probe in model=view coordinates.
      this.redProbePositionProperty = new Property( Vector2.ZERO, {
        tandem: tandem.createTandem( 'redProbePositionProperty' ),
        phetioType: PropertyIO( Vector2IO )
      } );

      // @public {Property.<Vector2>} - the position of the black probe in model=view coordinates
      this.blackProbePositionProperty = new Property( Vector2.ZERO, {
        tandem: tandem.createTandem( 'blackProbePositionProperty' ),
        phetioType: PropertyIO( Vector2IO )
      } );
    }

    /**
     * Reset the voltmeter, called when reset all is pressed.
     * @public
     * @override
     */
    reset() {
      super.reset();
      this.voltageProperty.reset();
      this.redProbePositionProperty.reset();
      this.blackProbePositionProperty.reset();
    }
  }

  return circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );
} );