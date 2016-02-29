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

  function Voltmeter() {
    PropertySet.call( this, {
      visible: false,
      bodyPosition: new Vector2( 0, 0 )
    } );
  }

  return inherit( PropertySet, Voltmeter, {} );
} );