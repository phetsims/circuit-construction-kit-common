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

  function Voltmeter() {
    PropertySet.call( this, { visible: false } );
  }

  return inherit( PropertySet, Voltmeter, {} );
} );