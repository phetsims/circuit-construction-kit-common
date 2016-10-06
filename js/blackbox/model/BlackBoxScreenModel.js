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
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function BlackBoxScreenModel() {
    this.sceneProperty = new Property( 'warmup' );
    Object.defineProperty( this, 'scene', this.sceneProperty.getDeclarator() );
  }

  circuitConstructionKitCommon.register( 'BlackBoxScreenModel', BlackBoxScreenModel );
  return inherit( Object, BlackBoxScreenModel );
} );