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
  var CircuitElementEditPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditPanel' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/SensorToolbox' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'DOT/Rectangle' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/VoltmeterNode' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsModel
   * @constructor
   */
  function CircuitConstructionKitBasicsScreenView( circuitConstructionKitBasicsModel ) {
    this.circuitConstructionKitBasicsModel = circuitConstructionKitBasicsModel;

    ScreenView.call( this );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        circuitConstructionKitBasicsModel.reset();
      }
    } );
    this.addChild( resetAllButton );

    var voltmeterNode = new VoltmeterNode( circuitConstructionKitBasicsModel.voltmeter );
    circuitConstructionKitBasicsModel.voltmeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( sensorToolbox.globalBounds ) ) {
        circuitConstructionKitBasicsModel.voltmeter.visible = false;
      }
    } );
    circuitConstructionKitBasicsModel.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNode.visible = visible;
    } );

    this.circuitNode = new CircuitNode( circuitConstructionKitBasicsModel.circuit );
    var circuitComponentToolbox = new CircuitComponentToolbox( circuitConstructionKitBasicsModel, this );
    var sensorToolbox = new SensorToolbox( voltmeterNode );

    this.addChild( sensorToolbox );
    this.addChild( circuitComponentToolbox );
    this.addChild( this.circuitNode );

    var visibleBoundsProperty = new Property( new Rectangle( 0, 0, this.layoutBounds.width, this.layoutBounds.height ) );
    this.events.on( 'layoutFinished', function( dx, dy, width, height ) {

      // Float the resetAllButton to the bottom right
      var inset = 14;
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

      circuitElementEditPanel.mutate( {
        centerX: -dx + width / 2,
        bottom: -dy + height - inset
      } );
      visibleBoundsProperty.set( new Rectangle( -dx, -dy, width, height ) );
    } );

    var circuitElementEditPanel = new CircuitElementEditPanel( circuitConstructionKitBasicsModel.circuit.lastCircuitElementProperty, visibleBoundsProperty );
    this.addChild( circuitElementEditPanel );

    this.addChild( voltmeterNode );
  }

  return inherit( ScreenView, CircuitConstructionKitBasicsScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );