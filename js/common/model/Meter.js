// Copyright 2016, University of Colorado Boulder

/**
 * Base class for Ammeter and Voltmeter
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );

  function Meter( additionalProperties ) {
    PropertySet.call( this, _.extend( {
      visible: false,
      bodyPosition: new Vector2( 0, 0 ),
      draggingTogether: true // When the meter is dragged from the toolbox, all pieces drag together as a single unit.
    }, additionalProperties ) );
    this.droppedEmitter = new Emitter(); // Fire event when dropped
  }

  circuitConstructionKitBasics.register( 'Meter', Meter );

  return inherit( PropertySet, Meter );
} );