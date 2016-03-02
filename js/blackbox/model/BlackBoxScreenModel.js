// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function BlackBoxScreenModel() {
    PropertySet.call( this, {
      scene: 'warmup'
    } );
  }

  return inherit( PropertySet, BlackBoxScreenModel );
} );