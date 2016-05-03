// Copyright 2015-2016, University of Colorado Boulder

/**
 * This model is solely responsible for choosing between different scenes, one for each black box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
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

  circuitConstructionKitBasics.register( 'BlackBoxScreenModel', BlackBoxScreenModel );
  return inherit( PropertySet, BlackBoxScreenModel );
} );