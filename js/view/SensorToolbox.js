// Copyright 2016-2017, University of Colorado Boulder

/**
 * This is the toolbox on the right hand side from which the voltmeter and ammeter can be dragged/dropped.  Exists for
 * the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Ammeter' );
  const AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCPanel' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SeriesAmmeterNode' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  const Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Voltmeter' );
  const VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );

  // strings
  const ammetersString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeters' );
  const ammeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter' );
  const voltmeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter' );

  // constants
  const TOOLBOX_ICON_SIZE = 53;
  const VOLTMETER_ICON_SCALE = 1.4;
  const ICON_TEXT_SPACING = 3; // distance in view coordinates from the isIcon to the text below the isIcon

  /**
   * @param {AlignGroup} alignGroup - for alignment with other controls
   * @param {Node} circuitLayerNode - the main circuit node to use as a coordinate frame
   * @param {VoltmeterNode} voltmeterNode - node for the Voltmeter
   * @param {AmmeterNode} ammeterNode - node for the Ammeter
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SensorToolbox( alignGroup, circuitLayerNode, voltmeterNode, ammeterNode, tandem, options ) {

    options = _.extend( {
      showResultsProperty: circuitLayerNode.model.isValueDepictionEnabledProperty,
      showSeriesAmmeters: true, // whether the series ammeters should be shown in the toolbox
      showNoncontactAmmeters: true // whether the noncontact ammeters should be shown in the toolbox
    }, options );

    /**
     * @param {Ammeter|Voltmeter} meterModel
     * @param {AmmeterNode|VoltmeterNode} meterNode
     * @returns {Object} a listener
     */
    const createListener = function( meterModel, meterNode ) {

      return SimpleDragHandler.createForwardingListener( function( event ) {
        const viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );
        meterModel.draggingProbesWithBodyProperty.set( true );
        meterModel.visibleProperty.set( true );
        meterModel.bodyPositionProperty.set( viewPosition );
        meterNode.dragHandler.startDrag( event );
      }, {
        allowTouchSnag: true
      } );
    };

    // Draggable isIcon for the voltmeter
    const voltmeter = new Voltmeter( tandem.createTandem( 'voltmeterIconModel' ) );
    const voltmeterNodeIcon = new VoltmeterNode( voltmeter, null, null, tandem.createTandem( 'voltmeterNodeIcon' ), { isIcon: true } );
    voltmeterNode.voltmeter.visibleProperty.link( function( visible ) { voltmeterNodeIcon.visible = !visible; } );
    voltmeterNodeIcon.mutate( {
      scale: TOOLBOX_ICON_SIZE * VOLTMETER_ICON_SCALE / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height )
    } );
    voltmeterNodeIcon.addInputListener( createListener( voltmeterNode.voltmeter, voltmeterNode ) );

    // Icon for the ammeter
    const ammeter = new Ammeter( tandem.createTandem( 'ammeterIconModel' ) );
    const ammeterNodeIcon = new AmmeterNode( ammeter, null, tandem.createTandem( 'ammeterNodeIcon' ), { isIcon: true } );
    ammeterNode.ammeter.visibleProperty.link( function( visible ) { ammeterNodeIcon.visible = !visible; } );
    ammeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );
    ammeterNodeIcon.addInputListener( createListener( ammeterNode.ammeter, ammeterNode ) );

    // Icon for the series ammeter
    const seriesAmmeter = new SeriesAmmeter(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CCKCConstants.SERIES_AMMETER_LENGTH, 0 ) ),
      tandem.createTandem( 'seriesAmmeterIconModel' )
    );
    const seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeter, tandem.createTandem( 'seriesAmmeterNodeIcon' ), {
      isIcon: true
    } );
    const createSeriesAmmeter = function( position ) {
      const halfLength = CCKCConstants.SERIES_AMMETER_LENGTH / 2;
      const startVertex = new Vertex( position.plusXY( -halfLength, 0 ) );
      const endVertex = new Vertex( position.plusXY( halfLength, 0 ) );
      return new SeriesAmmeter(
        startVertex,
        endVertex,
        circuitLayerNode.circuit.seriesAmmeterGroupTandem.createNextTandem()
      );
    };
    seriesAmmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / seriesAmmeterNodeIcon.width } );
    const seriesAmmeterToolNode = new CircuitElementToolNode(
      '',
      new Property( false ),
      new Property( CircuitElementViewType.SCHEMATIC ),
      circuitLayerNode.circuit,
      function( point ) {
        return circuitLayerNode.globalToLocalPoint( point );
      },
      seriesAmmeterNodeIcon,
      6,
      function() {
        return circuitLayerNode.circuit.circuitElements.count( function( circuitElement ) {

          return circuitElement instanceof SeriesAmmeter;
        } );
      }, createSeriesAmmeter, {
        touchAreaExpansionLeft: 3,
        touchAreaExpansionTop: 15,
        touchAreaExpansionRight: 3,
        touchAreaExpansionBottom: 0
      } );

    // Labels underneath the sensor tool nodes
    const voltmeterText = new Text( voltmeterString, { maxWidth: 60 } );
    const ammeterText = new Text( options.showSeriesAmmeters ? ammetersString : ammeterString, { maxWidth: 60 } );

    // Alter the visibility of the labels when the labels checkbox is toggled.
    circuitLayerNode.model.showLabelsProperty.linkAttribute( voltmeterText, 'visible' );
    circuitLayerNode.model.showLabelsProperty.linkAttribute( ammeterText, 'visible' );

    const voltmeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        voltmeterNodeIcon,
        voltmeterText
      ]
    } );

    const children = [];
    options.showNoncontactAmmeters && children.push( ammeterNodeIcon );
    options.showSeriesAmmeters && children.push( seriesAmmeterToolNode );

    const ammeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        new HBox( {
          spacing: 8,
          align: 'bottom',
          children: children
        } ),
        ammeterText
      ]
    } );

    CCKCPanel.call( this, alignGroup.createBox( new HBox( {
      spacing: ( options.showNoncontactAmmeters && options.showSeriesAmmeters ) ? 20 : 40,
      align: 'bottom',
      children: [ voltmeterToolIcon, ammeterToolIcon ]
    } ) ), tandem, {
      yMargin: 8
    } );
  }

  circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );

  return inherit( CCKCPanel, SensorToolbox );
} );