// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Meter' );

  function Voltmeter() {
    Meter.call( this, {
      voltage: null, // Null means no reading, otherwise {number} volts
      redProbePosition: new Vector2( 0, 0 ),
      blackProbePosition: new Vector2( 0, 0 )
    } );
  }

  circuitConstructionKitBasics.register( 'Voltmeter', Voltmeter );
  
  return inherit( Meter, Voltmeter );
} );