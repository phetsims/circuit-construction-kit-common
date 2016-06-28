// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * This model is solely responsible for choosing between different scenes, one for each black box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
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

  circuitConstructionKit.register( 'BlackBoxScreenModel', BlackBoxScreenModel );
  return inherit( PropertySet, BlackBoxScreenModel );
} );