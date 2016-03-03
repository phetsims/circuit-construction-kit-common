// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ExploreScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/explore/model/ExploreScreenModel' );
  var ExploreScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/explore/view/ExploreScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @constructor
   */
  function ExploreScreen() {

    var backgroundColor = '#c6dbf9';
    var icon = new Rectangle( 0, 0, Screen.NAVBAR_ICON_SIZE.width, Screen.NAVBAR_ICON_SIZE.height, {
      fill: backgroundColor
    } );

    Screen.call( this, 'Explore', icon, function() {
        return new ExploreScreenModel();
      }, function( model ) {
        return new ExploreScreenView( model );
      },
      { backgroundColor: '#c6dbf9' }
    );
  }

  return inherit( Screen, ExploreScreen );
} );