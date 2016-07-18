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

  function Ammeter( tandem ) {
    Meter.call( this, {
      current: null, // Null means no reading, otherwise {number} amps
      probePosition: new Vector2( 0, 0 )
    }, tandem, {
      current: tandem.createTandem( 'currentProperty' ),
      probePosition: tandem.createTandem( 'probePositionProperty' )
    } );
  }

  circuitConstructionKitCommon.register( 'Ammeter', Ammeter );

  return inherit( Meter, Ammeter );
} );