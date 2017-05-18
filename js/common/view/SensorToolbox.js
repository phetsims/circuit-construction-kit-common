// Copyright 2016-2017, University of Colorado Boulder

/**
 * This is the toolbox on the right hand side from which the voltmeter and ammeter can be dragged/dropped.
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitConstructionKitPanel' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/AmmeterNode' );
  var SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/SeriesAmmeterNode' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Ammeter' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/SeriesAmmeter' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var TOOLBOX_ICON_SIZE = 53;
  var VOLTMETER_ICON_SCALE = 1.3;

  /**
   * @param {Node} circuitNode - the main circuit node to use as a coordinate frame
   * @param {VoltmeterNode} voltmeterNode - node for the Voltmeter
   * @param {AmmeterNode} ammeterNode - node for the Ammeter
   * @param {Property.<boolean>} runningProperty - whether values can be displayed
   * @param {Tandem} tandem
   * @constructor
   */
  function SensorToolbox( circuitNode, voltmeterNode, ammeterNode, runningProperty, tandem ) {

    // Options for the VoltmeterNode and AmmeterNode
    var options = {
      icon: true,
      runningProperty: runningProperty
    };

    /**
     * @param {Ammeter|Voltmeter} meterModel
     * @param {AmmeterNode|VoltmeterNode} meterNode
     * @returns {Object} a listener
     */
    var createListener = function( meterModel, meterNode ) {
      return {
        down: function( event ) {
          var viewPosition = circuitNode.globalToLocalPoint( event.pointer.point );
          meterModel.draggingProbesWithBodyProperty.set( true );
          meterModel.visibleProperty.set( true );
          meterModel.bodyPositionProperty.set( viewPosition );
          meterNode.dragHandler.startDrag( event );
        }
      };
    };

    // Draggable icon for the voltmeter
    var voltmeter = new Voltmeter( tandem.createTandem( 'voltmeterIconModel' ) );
    var voltmeterNodeIcon = new VoltmeterNode( voltmeter, tandem.createTandem( 'voltmeterNodeIcon' ), options );
    voltmeterNode.voltmeter.visibleProperty.link( function( visible ) { voltmeterNodeIcon.visible = !visible; } );
    voltmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE * VOLTMETER_ICON_SCALE / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height ) } );
    voltmeterNodeIcon.addInputListener( createListener( voltmeterNode.voltmeter, voltmeterNode ) );

    // Icon for the ammeter
    var ammeter = new Ammeter( tandem.createTandem( 'ammeterIconModel' ) );
    var ammeterNodeIcon = new AmmeterNode( ammeter, tandem.createTandem( 'ammeterNodeIcon' ), options );
    ammeterNode.ammeter.visibleProperty.link( function( visible ) { ammeterNodeIcon.visible = !visible; } );
    ammeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );
    ammeterNodeIcon.addInputListener( createListener( ammeterNode.ammeter, ammeterNode ) );

    // Icon for the series ammeter
    var seriesAmmeter = new SeriesAmmeter( new Vertex( 0, 0 ), new Vertex( 100, 0 ), tandem.createTandem( 'seriesAmmeterIconModel' ) );
    var seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeter, null, null, tandem.createTandem( 'seriesAmmeterNodeIcon' ), {
      icon: true
    } );
    seriesAmmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / seriesAmmeterNodeIcon.width } );

    CircuitConstructionKitPanel.call( this, new HBox( {
      spacing: 20,
      align: 'bottom',
      children: [ new VBox( {
        spacing: 3,
        children: [
          voltmeterNodeIcon,
          new Text( 'Voltmeter' )
        ]
      } ), new VBox( {
        spacing: 3,// TODO: factor out
        // TODO: support screen 1-2 that only show probes
        children: [
          new HBox( {
            spacing: 8,
            align: 'bottom',
            children: [
              ammeterNodeIcon, seriesAmmeterNodeIcon
            ]
          } ),
          new Text( 'Ammeters' )
        ]
      } ) ]
    } ), tandem, {
      xMargin: 10,
      yMargin: 8
    } );
  }

  circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );

  return inherit( CircuitConstructionKitPanel, SensorToolbox );
} );