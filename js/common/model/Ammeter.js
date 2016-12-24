// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Model for the Ammeter, which adds the probe position and current readout
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

  function Ammeter( tandem ) {

    Meter.call( this, tandem );

    // @public Null means no reading, otherwise {number} amps
    this.currentProperty = new Property( null, {
      tandem: tandem.createTandem( 'currentProperty' ),
      phetioValueType: TNumber( { units: 'amperes' } )
    } );
    this.probePositionProperty = new Property( new Vector2(), {
      tandem: tandem.createTandem( 'probePositionProperty' ),
      phetioValueType: TVector2
    } );

    Property.preventGetSet( this, 'current' );
    Property.preventGetSet( this, 'probePosition' );
  }

  circuitConstructionKitCommon.register( 'Ammeter', Ammeter );

  return inherit( Meter, Ammeter );
} );