// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Meter' );

  function Voltmeter() {
    Meter.call( this, {
      voltage: null, // Null means no reading, otherwise {number} volts
      redProbePosition: new Vector2( 0, 0 ),
      blackProbePosition: new Vector2( 0, 0 )
    } );
  }

  circuitConstructionKit.register( 'Voltmeter', Voltmeter );

  return inherit( Meter, Voltmeter );
} );