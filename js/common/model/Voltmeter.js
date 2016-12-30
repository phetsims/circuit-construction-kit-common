// Copyright 2016, University of Colorado Boulder

/**
 * The model for a voltmeter, which has a red and black probe and reads out voltage between vertices/wires.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Meter' );
  var Property = require( 'AXON/Property' );

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  function Voltmeter( tandem ) {

    Meter.call( this, tandem );

    // @public {Property.<number|null>} the voltage the probe is reading, in volts
    this.voltageProperty = new Property( null, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      phetioValueType: TNumber( { units: 'volts' } )
    } );

    // @public - the position of the tip of the red probe in model=view coordinates.
    this.redProbePositionProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'redProbePositionProperty' ),
      phetioValueType: TVector2
    } );

    // @public - the position of the black probe in model=view coordinates
    this.blackProbePositionProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'blackProbePositionProperty' ),
      phetioValueType: TVector2
    } );

    Property.preventGetSet( this, 'voltage' );
    Property.preventGetSet( this, 'redProbePosition' );
    Property.preventGetSet( this, 'blackProbePosition' );
  }

  circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );

  return inherit( Meter, Voltmeter, {

    /**
     * Reset the voltmeter, called when reset all is pressed.
     */
    reset: function() {
      Meter.prototype.reset.call( this );
      this.voltageProperty.reset();
      this.redProbePositionProperty.reset();
      this.blackProbePositionProperty.reset();
    }
  } );
} );