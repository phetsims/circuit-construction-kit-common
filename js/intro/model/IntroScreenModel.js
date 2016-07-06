// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Keeps track of which scene is selected.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function IntroScreenModel() {
    PropertySet.call( this, {
      selectedScene: 0
    } );
  }

  circuitConstructionKitCommon.register( 'IntroScreenModel', IntroScreenModel );

  return inherit( PropertySet, IntroScreenModel );
} );