// Copyright 2015-2016, University of Colorado Boulder

/**
 * Shows the selected scene, and relays the visible bounds to each IntroSceneNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IntroSceneNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/view/IntroSceneNode' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var IntroSceneModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/model/IntroSceneModel' );

  /**
   * @param {CircuitConstructionKitBasicsModel} introScreenModel
   * @constructor
   */
  function IntroScreenView( introScreenModel ) {
    var introScreenView = this;
    ScreenView.call( this );

    var sceneNodes = {};

    this.visibleBoundsProperty.link( function( visibleBounds ) {
      _.values( sceneNodes ).forEach( function( sceneNode ) {
        sceneNode.visibleBoundsProperty.set( visibleBounds );
      } );
    } );

    // The scene buttons are declared in each IntroSceneNode so that objects may be layered in front of them instead
    // of getting lost behind them.
    introScreenModel.selectedSceneProperty.link( function( selectedScene ) {
      if ( !sceneNodes[ selectedScene ] ) {
        var sceneNode = new IntroSceneNode( new IntroSceneModel( introScreenView.layoutBounds, introScreenModel.selectedSceneProperty ) );
        sceneNode.visibleBoundsProperty.set( introScreenView.visibleBoundsProperty.value );
        sceneNodes[ selectedScene ] = sceneNode;
      }

      introScreenView.children = [ sceneNodes[ selectedScene ] ];
    } );
  }

  return inherit( ScreenView, IntroScreenView );
} );