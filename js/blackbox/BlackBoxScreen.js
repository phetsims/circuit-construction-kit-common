// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The 'Black Box' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var BlackBoxScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/model/BlackBoxScreenModel' );
  var BlackBoxScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/BlackBoxScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var BlackBoxNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/blackbox/view/BlackBoxNode' );
  var Property = require( 'AXON/Property' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // constants
  var backgroundColor = CircuitConstructionKitConstants.backgroundColor;

  /**
   * @constructor
   */
  function BlackBoxScreen( tandem ) {

    var icon = new Rectangle( 0, 0, Screen.HOME_SCREEN_ICON_SIZE.width, Screen.HOME_SCREEN_ICON_SIZE.height, {
      fill: backgroundColor
    } );
    var blackBoxNode = new BlackBoxNode( 220, 160, new Property( true ) );
    blackBoxNode.mutate( {
      scale: icon.width / blackBoxNode.bounds.width / 2,
      centerX: icon.centerX,
      centerY: icon.centerY
    } );
    icon.addChild( blackBoxNode );

    Screen.call( this, 'Black Box', icon, function() {
      return new BlackBoxScreenModel( tandem.createTandem( 'model' ) );
      }, function( model ) {
      return new BlackBoxScreenView( model, tandem.createTandem( 'view' ) );
      }, {
        tandem: tandem
      }
    );
  }

  circuitConstructionKitCommon.register( 'BlackBoxScreen', BlackBoxScreen );
  return inherit( Screen, BlackBoxScreen );
} );