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

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  function Ammeter( tandem ) {

    // additional Properties added to the supertype
    var additionalProperties = {

      // Null means no reading, otherwise {number} amps
      current: {
        value: null,
        tandem: tandem.createTandem( 'currentProperty' ),
        phetioValueType: TNumber( { units: 'amperes' } )
      },

      probePosition: {
        value: new Vector2( 0, 0 ),
        tandem: tandem.createTandem( 'probePositionProperty' ),
        phetioValueType: TVector2
      }
    };

    Meter.call( this, tandem, additionalProperties );
  }

  circuitConstructionKitCommon.register( 'Ammeter', Ammeter );

  return inherit( Meter, Ammeter );
} );