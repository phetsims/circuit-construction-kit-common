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
      bodyPosition: new Vector2( 0, 0 ),
      redProbePosition: new Vector2( 0, 0 ),
      blackProbePosition: new Vector2( 0, 0 ),
      draggingTogether: true // When the voltmeter is dragged from the toolbox, all pieces drag together as a single unit.
    } );
    this.droppedEmitter = new Emitter(); // Fire event when dropped
  }

  return inherit( PropertySet, Voltmeter, {} );
} );