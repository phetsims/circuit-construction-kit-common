// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
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

    // @public Null means no reading, otherwise {number} volts
    this.voltageProperty = new Property( null, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      phetioValueType: TNumber( { units: 'volts' } )
    } );

    this.redProbePositionProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'redProbePositionProperty' ),
      phetioValueType: TVector2
    } );

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
    reset: function() {
      Meter.prototype.reset.call( this );
      this.voltageProperty.reset();
      this.redProbePositionProperty.reset();
      this.blackProbePositionProperty.reset();
    }
  } );
} );