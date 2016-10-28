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

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  function Voltmeter( tandem ) {

    // additional Properties added to the supertype
    var additionalProperties = {

      // Null means no reading, otherwise {number} volts
      voltage: {
        value: null,
        tandem: tandem.createTandem( 'voltageProperty' ),
        phetioValueType: TNumber( { units: 'volts' } )
      },

      redProbePosition: {
        value: new Vector2( 0, 0 ),
        tandem: tandem.createTandem( 'redProbePositionProperty' ),
        phetioValueType: TVector2
      },

      blackProbePosition: {
        value: new Vector2( 0, 0 ),
        tandem: tandem.createTandem( 'blackProbePositionProperty' ),
        phetioValueType: TVector2
      }
    };

    Meter.call( this, tandem, additionalProperties );
  }

  circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );

  return inherit( Meter, Voltmeter );
} );