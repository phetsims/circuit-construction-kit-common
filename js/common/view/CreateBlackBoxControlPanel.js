// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var Property = require( 'AXON/Property' );

  function CreateBlackBoxControlPanel() {
    Panel.call( this, new NumberControl( 'Black Box Width' ), new Property() );
  }

  return inherit( Panel, CreateBlackBoxControlPanel, {} );
} );