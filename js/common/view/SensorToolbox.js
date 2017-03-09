// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitConstructionKitPanel' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/AmmeterNode' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Ammeter' );

  // constants
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitConstants.TOOLBOX_ICON_SIZE;

  function SensorToolbox( circuitNode, voltmeterNode, ammeterNode, runningProperty, tandem ) {
    var voltmeterNodeIcon = new VoltmeterNode( new Voltmeter( tandem.createTandem( 'voltmeterIconModel' ) ), tandem.createTandem( 'voltmeterNodeIcon' ), {
      runningProperty: runningProperty,
      icon: true
    } );
    voltmeterNode.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNodeIcon.visible = !visible;
    } );
    var voltmeterIconSizeIncrease = 1.3;
    voltmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE * voltmeterIconSizeIncrease / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height ) } );
    voltmeterNodeIcon.addInputListener( {
      down: function( event ) {
        var viewPosition = circuitNode.globalToLocalPoint( event.pointer.point );
        voltmeterNode.voltmeter.draggingProbesWithBodyProperty.set( true );
        voltmeterNode.voltmeter.visibleProperty.set( true );
        voltmeterNode.voltmeter.bodyPositionProperty.set( viewPosition );
        voltmeterNode.dragHandler.startDrag( event );
      }
    } );

    var ammeterNodeIcon = new AmmeterNode( new Ammeter( tandem.createTandem( 'ammeterIconModel' ) ), tandem.createTandem( 'ammeterNodeIcon' ), {
      icon: true,
      runningProperty: runningProperty
    } );
    ammeterNode.ammeter.visibleProperty.link( function( visible ) {
      ammeterNodeIcon.visible = !visible;
    } );
    ammeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );
    ammeterNodeIcon.addInputListener( {
      down: function( event ) {
        var viewPosition = circuitNode.globalToLocalPoint( event.pointer.point );
        ammeterNode.ammeter.draggingProbesWithBodyProperty.set( true );
        ammeterNode.ammeter.visibleProperty.set( true );
        ammeterNode.ammeter.bodyPositionProperty.set( viewPosition );
        ammeterNode.dragHandler.startDrag( event );
      }
    } );

    CircuitConstructionKitPanel.call( this, new HBox( {
      spacing: CircuitConstructionKitConstants.TOOLBOX_ITEM_SPACING,
      align: 'bottom',
      children: [
        voltmeterNodeIcon,
        ammeterNodeIcon
      ]
    } ), tandem );
  }

  circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );

  return inherit( CircuitConstructionKitPanel, SensorToolbox, {} );
} );