// Copyright 2016, University of Colorado Boulder

/**
 * Model for the Ammeter, which adds the probe position and current readout
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

  function Ammeter() {
    Meter.call( this, {
      current: null, // Null means no reading, otherwise {number} amps
      probePosition: new Vector2( 0, 0 )
    } );
  }

  circuitConstructionKitBasics.register( 'Ammeter', Ammeter );
  
  return inherit( Meter, Ammeter );
} );