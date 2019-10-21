// Copyright 2016-2019, University of Colorado Boulder

/**
 * This is the toolbox on the right hand side from which the voltmeter and ammeter can be dragged/dropped.  Exists for
 * the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Ammeter' );
  const AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCPanel' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const CurrentChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CurrentChartNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSeparator = require( 'SUN/HSeparator' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SeriesAmmeterNode' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  const VoltageChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltageChartNode' );
  const Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Voltmeter' );
  const VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );

  // strings
  const ammetersString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeters' );
  const ammeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter' );
  const currentChartString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/currentChart' );
  const voltageChartString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageChart' );
  const voltmeterString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter' );

  // constants
  const TOOLBOX_ICON_SIZE = 53;
  const VOLTMETER_ICON_SCALE = 1.4;
  const ICON_TEXT_SPACING = 3; // distance in view coordinates from the isIcon to the text below the isIcon

  class SensorToolbox extends CCKCPanel {

    /**
     * @param {AlignGroup} alignGroup - for alignment with other controls
     * @param {Node} circuitLayerNode - the main circuit node to use as a coordinate frame
     * @param {VoltmeterNode[]} voltmeterNodes - nodes that display the Voltmeters
     * @param {AmmeterNode[]} ammeterNodes - nodes that display the Ammeters
     * @param {VoltageChartNode|undefined} voltageChartNode - node for the VoltageChartNode
     * @param {CurrentChartNode|undefined} currentChartNode - node for the VoltageChartNode
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    // TODO: voltageChartNode and currentChartNode should be optional and only appear in the AC sim
    constructor( alignGroup, circuitLayerNode, voltmeterNodes, ammeterNodes, voltageChartNode, currentChartNode, tandem, options ) {
      const circuit = circuitLayerNode.circuit;

      options = merge( {
        showResultsProperty: circuitLayerNode.model.isValueDepictionEnabledProperty,
        showSeriesAmmeters: true, // whether the series ammeters should be shown in the toolbox
        showNoncontactAmmeters: true, // whether the noncontact ammeters should be shown in the toolbox
        showCharts: false
      }, options );

      /**
       * @param {Meter} meterModel
       * @param {AmmeterNode|VoltmeterNode} meterNode
       * @returns {Object} a listener
       */
      const createListener = ( meterModel, meterNode ) =>
        SimpleDragHandler.createForwardingListener( event => {
          const viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );
          meterModel.draggingProbesWithBodyProperty.set( true );
          meterModel.visibleProperty.set( true );
          meterModel.bodyPositionProperty.set( viewPosition );
          meterNode.startDrag( event );
        }, {
          allowTouchSnag: true
        } );

      /**
       * @param {VoltmeterNode[]|AmmeterNode[]} meterNodes
       * @param {string} meterModelName 'ammeter'|'voltmeter' for looking up the correpsponding models
       * @returns {Object} a listener
       */
      const createListenerMulti = ( meterNodes, meterModelName ) =>
        SimpleDragHandler.createForwardingListener( event => {

          // Select a non-visible meter node
          const meterNode = _.find( meterNodes, meterNode => !meterNode.visible );
          const meterModel = meterNode[ meterModelName ];
          const viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );
          meterModel.draggingProbesWithBodyProperty.value = true;
          meterModel.visibleProperty.value = true;
          meterModel.bodyPositionProperty.value = viewPosition;
          meterNode.startDrag( event );
        }, {
          allowTouchSnag: true
        } );

      // Draggable isIcon for the voltmeter
      const voltmeter = new Voltmeter( Tandem.optional );
      const voltmeterNodeIcon = new VoltmeterNode( voltmeter, null, null, tandem.createTandem( 'voltmeterNodeIcon' ), {
        isIcon: true
      } );
      const allVoltmetersVisibleProperty = DerivedProperty.and( voltmeterNodes.map( voltmeterNode => voltmeterNode.voltmeter.visibleProperty ) );
      allVoltmetersVisibleProperty.link( visible => voltmeterNodeIcon.setVisible( !visible ) );
      voltmeterNodeIcon.mutate( {
        scale: TOOLBOX_ICON_SIZE * VOLTMETER_ICON_SCALE / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height )
      } );
      voltmeterNodeIcon.addInputListener( createListenerMulti( voltmeterNodes, 'voltmeter' ) );

      // Icon for the ammeter
      const ammeter = new Ammeter( tandem.createTandem( 'ammeterIconModel' ) );
      const ammeterNodeIcon = new AmmeterNode( ammeter, null, tandem.createTandem( 'ammeterNodeIcon' ), {
        isIcon: true
      } );
      const allAmmetersVisibleProperty = DerivedProperty.and( ammeterNodes.map( ammeterNode => ammeterNode.ammeter.visibleProperty ) );
      allAmmetersVisibleProperty.link( visible => ammeterNodeIcon.setVisible( !visible ) );
      ammeterNodeIcon.mutate( {
        scale: TOOLBOX_ICON_SIZE / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height )
      } );
      ammeterNodeIcon.addInputListener( createListenerMulti( ammeterNodes, 'ammeter' ) );

      // Icon for the series ammeter
      const seriesAmmeterIcon = new SeriesAmmeter(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( CCKCConstants.SERIES_AMMETER_LENGTH, 0 ) ),
        Tandem.optional
      );
      const seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeterIcon, tandem.createTandem( 'seriesAmmeterNodeIcon' ), {
        isIcon: true
      } );
      const createSeriesAmmeter = ( position, isIcon ) => {
        const halfLength = CCKCConstants.SERIES_AMMETER_LENGTH / 2;
        const startVertex = circuit.vertexGroup.createNextMember( position.plusXY( -halfLength, 0 ) );
        const endVertex = circuit.vertexGroup.createNextMember( position.plusXY( halfLength, 0 ) );
        return new SeriesAmmeter(
          startVertex,
          endVertex,
          circuit.seriesAmmeterGroupTandem.createNextTandem()
        );
      };
      seriesAmmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_SIZE / seriesAmmeterNodeIcon.width } );
      const seriesAmmeterToolNode = new CircuitElementToolNode(
        '',
        new Property( false ),
        new Property( CircuitElementViewType.SCHEMATIC ),
        circuit,
        point => circuitLayerNode.globalToLocalPoint( point ),
        seriesAmmeterNodeIcon,
        6,
        () => circuit.circuitElements.count( circuitElement => circuitElement instanceof SeriesAmmeter ),
        createSeriesAmmeter, {
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

      const topBox = alignGroup.createBox( new HBox( {
        spacing: ( options.showNoncontactAmmeters && options.showSeriesAmmeters ) ? 20 : 40,
        align: 'bottom',
        children: [ voltmeterToolIcon, ammeterToolIcon ]
      } ) );

      const rows = [ topBox ];
      if ( options.showCharts ) {
        const everything = new Property( Bounds2.EVERYTHING );

        const createChartToolIcon = ( chartNode, chartNodeIcon, labelNode ) => {

          // Rasterization comes out blurry, instead put an overlay to intercept input events.
          const overlay = Rectangle.bounds( chartNodeIcon.bounds, { fill: 'blue', opacity: 0 } );
          const container = new Node( {
            children: [ chartNodeIcon, overlay ],
            cursor: 'pointer'
          } );
          const chartToolIcon = new VBox( {
            spacing: ICON_TEXT_SPACING,
            children: [ container, labelNode ]
          } );

          chartNode.meter.visibleProperty.link( visible => chartNodeIcon.setVisible( !visible ) );
          overlay.addInputListener( createListener( chartNode.meter, chartNode ) );

          return chartToolIcon;
        };

        // Make the voltage chart the same width as the voltmeter, since the icons will be aligned in a grid
        const voltageChartNodeIconContents = new VoltageChartNode( circuitLayerNode, new NumberProperty( 0 ), everything );
        const scale = voltmeterToolIcon.width / voltageChartNodeIconContents.width;
        voltageChartNodeIconContents.scale( scale );

        const voltageChartToolIcon = createChartToolIcon(
          voltageChartNode,
          voltageChartNodeIconContents,
          new Text( voltageChartString, { maxWidth: 60 } )
        );
        const currentChartToolIcon = createChartToolIcon(
          currentChartNode,
          new CurrentChartNode( circuitLayerNode, new NumberProperty( 0 ), everything, { scale: scale } ),
          new Text( currentChartString, { maxWidth: 60 } )
        );

        // TODO: we will need to change to a grid layout for this, don't forget to support options.showSeriesAmmeters
        voltageChartToolIcon.centerX = voltmeterToolIcon.centerX;
        currentChartToolIcon.centerX = ammeterToolIcon.centerX;
        const chartBox = new Node( {
          children: [ voltageChartToolIcon, currentChartToolIcon ]
        } );

        rows.push( new HSeparator( 160 ) );
        rows.push( chartBox );
      }

      super( new VBox( {
        spacing: 5,
        children: rows
      } ), tandem, {
        yMargin: 8
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );
} );