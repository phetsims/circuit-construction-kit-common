// Copyright 2015, University of Colorado Boulder

/**
 * The 'Black Box' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackBoxScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/model/BlackBoxScreenModel' );
  var BlackBoxScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var circuitConstructionKitBasicsTitleString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_BASICS/circuit-construction-kit-basics.title' );

  /**
   * @constructor
   */
  function BlackBoxScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = new Rectangle( 0, 0, Screen.NAVBAR_ICON_SIZE.width, Screen.NAVBAR_ICON_SIZE.height, { fill: 'gray' } );

    Screen.call( this, circuitConstructionKitBasicsTitleString, icon, function() {
        return new BlackBoxScreenModel();
      }, function( model ) {
        return new BlackBoxScreenView( model );
      },
      { backgroundColor: '#c6dbf9' }
    );
  }

  return inherit( Screen, BlackBoxScreen );
} );