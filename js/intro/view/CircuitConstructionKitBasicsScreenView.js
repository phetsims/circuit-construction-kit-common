// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var CircuitNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitNode' );
  var CircuitComponentToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitComponentToolbox' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/SensorToolbox' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsModel
   * @constructor
   */
  function CircuitConstructionKitBasicsScreenView( circuitConstructionKitBasicsModel ) {

    ScreenView.call( this );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        circuitConstructionKitBasicsModel.reset();
      }
    } );
    this.addChild( resetAllButton );

    this.addChild( new CircuitNode( circuitConstructionKitBasicsModel.circuit ) );

    var circuitComponentToolbox = new CircuitComponentToolbox();
    this.addChild( circuitComponentToolbox );

    var sensorToolbox = new SensorToolbox();
    this.addChild( sensorToolbox );

    this.events.on( 'layoutFinished', function( dx, dy, width, height ) {

      // Float the resetAllButton to the bottom right
      var inset = 10;
      resetAllButton.mutate( {
        right: -dx + width - inset,
        bottom: -dy + height - inset
      } );

      circuitComponentToolbox.mutate( {
        left: -dx + inset,
        top: -dy + inset
      } );

      sensorToolbox.mutate( {
        right: -dx + width - inset,
        top: -dy + inset
      } );
    } );
  }

  return inherit( ScreenView, CircuitConstructionKitBasicsScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );