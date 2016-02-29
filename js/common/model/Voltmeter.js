// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );

  function Voltmeter() {
    PropertySet.call( this, {
      visible: false,
      bodyPosition: new Vector2( 0, 0 )
    } );
    this.droppedEmitter = new Emitter(); // Fire event when dropped
  }

  return inherit( PropertySet, Voltmeter, {} );
} );