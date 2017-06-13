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
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitPanel' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  var SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SeriesAmmeterNode' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Ammeter' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // strings
  var ammeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter' );
  var ammetersString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeters' );
  var voltmeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter' );

  // constants
  var TOOLBOX_ICON_SIZE = 53;
  var VOLTMETER_ICON_SCALE = 1.3;
  var ICON_TEXT_SPACING = 3; // distance in view coordinates from the icon to the text below the icon

  /**
   * @param {AlignGroup} alignGroup - for alignment with other controls
   * @param {Node} circuitLayerNode - the main circuit node to use as a coordinate frame
   * @param {VoltmeterNode} voltmeterNode - node for the Voltmeter
   * @param {AmmeterNode} ammeterNode - node for the Ammeter
   * @param {Property.<boolean>} showResultsProperty - whether values can be displayed
   * @param {Property.<boolean>} showLabelsProperty - true if toolbox labels should be shown
   * @param {boolean} showSeriesAmmeters - whether the series ammeters should be shown in the toolbox
   * @param {Tandem} tandem
   * @constructor
   */
  function SensorToolbox( alignGroup, circuitLayerNode, voltmeterNode, ammeterNode, showResultsProperty, showLabelsProperty, showSeriesAmmeters, tandem ) {

    // Options for the VoltmeterNode and AmmeterNode
    var options = {
      icon: true,
      showResultsProperty: showResultsProperty
    };

    /**
     * @param {Ammeter|Voltmeter} meterModel
     * @param {AmmeterNode|VoltmeterNode} meterNode
     * @returns {Object} a listener
     */
    var createListener = function( meterModel, meterNode ) {
      return {
        down: function( event ) {
          var viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );
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
    var seriesAmmeter = new SeriesAmmeter( new Vertex( 0, 0 ), new Vertex( CircuitConstructionKitConstants.SERIES_AMMETER_LENGTH, 0 ), tandem.createTandem( 'seriesAmmeterIconModel' ) );
    var seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeter, null, null, tandem.createTandem( 'seriesAmmeterNodeIcon' ), {
      icon: true
    } );
    var createSeriesAmmeter = function( position ) {
      var startVertex = new Vertex( position.x - CircuitConstructionKitConstants.SERIES_AMMETER_LENGTH / 2, position.y );
      var endVertex = new Vertex( position.x + CircuitConstructionKitConstants.SERIES_AMMETER_LENGTH / 2, position.y );
      return new SeriesAmmeter( startVertex, endVertex, circuitLayerNode.circuit.seriesAmmeterGroupTandem.createNextTandem() );
    };
    seriesAmmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / seriesAmmeterNodeIcon.width } );
    var seriesAmmeterToolNode = new CircuitElementToolNode( '', new Property( false ), circuitLayerNode, seriesAmmeterNodeIcon, 6, function() {
      return circuitLayerNode.circuit.circuitElements.filter( function( circuitElement ) {

        return circuitElement instanceof SeriesAmmeter;
      } ).length;
    }, createSeriesAmmeter );

    // Labels underneath the sensor tool nodes
    var voltmeterText = new Text( voltmeterString );
    var ammeterText = new Text( showSeriesAmmeters ? ammetersString : ammeterString );

    // Alter the visibility of the labels when the labels checkbox is toggled.
    showLabelsProperty.linkAttribute( voltmeterText, 'visible' );
    showLabelsProperty.linkAttribute( ammeterText, 'visible' );

    var voltmeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        voltmeterNodeIcon,
        voltmeterText
      ]
    } );
    var ammeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        new HBox( {
          spacing: 8,
          align: 'bottom',
          children: showSeriesAmmeters ? [ ammeterNodeIcon, seriesAmmeterToolNode ] : [ ammeterNodeIcon ]
        } ),
        ammeterText
      ]
    } );

    CircuitConstructionKitPanel.call( this, alignGroup.createBox( new HBox( {
      spacing: showSeriesAmmeters ? 20 : 40,
      align: 'bottom',
      children: [ voltmeterToolIcon, ammeterToolIcon ]
    } ) ), tandem, {
      yMargin: 8
    } );
  }

  circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );

  return inherit( CircuitConstructionKitPanel, SensorToolbox );
} );