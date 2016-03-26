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
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/BlackBoxNode' );

  /**
   * @constructor
   */
  function BlackBoxScreen() {

    var backgroundColor = '#c6dbf9';
    var icon = new Rectangle( 0, 0, Screen.NAVBAR_ICON_SIZE.width, Screen.NAVBAR_ICON_SIZE.height, {
      fill: backgroundColor
    } );
    var blackBoxNode = new BlackBoxNode( 220, 160 );
    blackBoxNode.mutate( {
      scale: icon.width / blackBoxNode.bounds.width / 2,
      centerX: icon.centerX,
      centerY: icon.centerY
    } );
    icon.addChild( blackBoxNode );

    Screen.call( this, 'Black Box', icon, function() {
        return new BlackBoxScreenModel();
      }, function( model ) {
        return new BlackBoxScreenView( model );
      }, {
        backgroundColor: '#c6dbf9'
      }
    );
  }

  return inherit( Screen, BlackBoxScreen );
} );