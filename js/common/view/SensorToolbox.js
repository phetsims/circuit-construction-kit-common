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

  function SensorToolbox( voltmeterNode, ammeterNode, runningProperty, tandem ) {
    var sensorToolbox = this;
    var toolIconLength = CircuitConstructionKitConstants.toolboxIconLength;

    var voltmeterNodeIcon = new VoltmeterNode( new Voltmeter( tandem.createTandem( 'voltmeterIconModel' ) ), tandem.createTandem( 'voltmeterNodeIcon' ), {
      runningProperty: runningProperty,
      icon: true
    } );
    voltmeterNode.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNodeIcon.visible = !visible;
    } );
    var voltmeterIconSizeIncrease = 1.3;
    voltmeterNodeIcon.mutate( { scale: toolIconLength * voltmeterIconSizeIncrease / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height ) } );
    voltmeterNodeIcon.addInputListener( {
      down: function( event ) {
        var viewPosition = sensorToolbox.globalToParentPoint( event.pointer.point );
        voltmeterNode.voltmeter.draggingTogether = true;
        voltmeterNode.voltmeter.visible = true;
        voltmeterNode.voltmeter.bodyPosition = viewPosition;
        voltmeterNode.movableDragHandler.startDrag( event );
      }
    } );

    var ammeterNodeIcon = new AmmeterNode( new Ammeter( tandem.createTandem( 'ammeterIconModel' ) ), tandem.createTandem( 'ammeterNodeIcon' ), {
      icon: true,
      runningProperty: runningProperty
    } );
    ammeterNode.ammeter.visibleProperty.link( function( visible ) {
      ammeterNodeIcon.visible = !visible;
    } );
    ammeterNodeIcon.mutate( { scale: toolIconLength / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );
    ammeterNodeIcon.addInputListener( {
      down: function( event ) {
        var viewPosition = sensorToolbox.globalToParentPoint( event.pointer.point );
        ammeterNode.ammeter.draggingTogether = true;
        ammeterNode.ammeter.visible = true;
        ammeterNode.ammeter.bodyPosition = viewPosition;
        ammeterNode.movableDragHandler.startDrag( event );
      }
    } );

    CircuitConstructionKitPanel.call( this, new HBox( {
      spacing: CircuitConstructionKitConstants.toolboxItemSpacing,
      align: 'bottom',
      children: [
        voltmeterNodeIcon,
        ammeterNodeIcon
      ]
    } ) );
  }

  circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );

  return inherit( CircuitConstructionKitPanel, SensorToolbox, {} );
} );