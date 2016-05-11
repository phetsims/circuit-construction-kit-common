// Copyright 2015-2016, University of Colorado Boulder

/**
 * Keeps track of which scene is selected.
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
  function IntroScreenModel() {
    PropertySet.call( this, {
      selectedScene: 0
    } );
  }

  circuitConstructionKit.register( 'IntroScreenModel', IntroScreenModel );

  return inherit( PropertySet, IntroScreenModel );
} );