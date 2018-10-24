// Copyright 2016-2017, University of Colorado Boulder

/**
 * The model for a voltmeter, which has a red and black probe and reads out voltage between vertices/wires. Exists
 * for the life of the sim and hence a dispose implementation is not needed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Meter' );
  var NullableIO = require( 'TANDEM/types/NullableIO' );
  var NumberIO = require( 'TANDEM/types/NumberIO' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Voltmeter( tandem ) {

    Meter.call( this, tandem );

    // @public {Property.<number|null>} the voltage the probe is reading (in volts) or null if unconnected
    this.voltageProperty = new Property( null, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      units: 'volts',
      phetioType: PropertyIO( NullableIO( NumberIO ))
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

  circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );

  return inherit( Meter, Voltmeter, {

    /**
     * Reset the voltmeter, called when reset all is pressed.
     * @public
     * @override
     */
    reset: function() {
      Meter.prototype.reset.call( this );
      this.voltageProperty.reset();
      this.redProbePositionProperty.reset();
      this.blackProbePositionProperty.reset();
    }
  } );
} );