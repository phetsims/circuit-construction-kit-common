// Copyright 2016-2020, University of Colorado Boulder

/**
 * This is the toolbox on the right hand side from which the voltmeter and ammeter can be dragged/dropped.  Exists for
 * the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import SimpleDragHandler from '../../../scenery/js/input/SimpleDragHandler.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Ammeter from '../model/Ammeter.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Vertex from '../model/Vertex.js';
import Voltmeter from '../model/Voltmeter.js';
import AmmeterNode from './AmmeterNode.js';
import CCKCPanel from './CCKCPanel.js';
import CircuitElementToolNode from './CircuitElementToolNode.js';
import CurrentChartNode from './CurrentChartNode.js';
import SeriesAmmeterNode from './SeriesAmmeterNode.js';
import VoltageChartNode from './VoltageChartNode.js';
import VoltmeterNode from './VoltmeterNode.js';

const ammetersString = circuitConstructionKitCommonStrings.ammeters;
const ammeterString = circuitConstructionKitCommonStrings.ammeter;
const currentChartString = circuitConstructionKitCommonStrings.currentChart;
const voltageChartString = circuitConstructionKitCommonStrings.voltageChart;
const voltmeterString = circuitConstructionKitCommonStrings.voltmeter;

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
   * @param {VoltageChartNode|null} voltageChartNode - node for the VoltageChartNode, if present
   * @param {CurrentChartNode|null} currentChartNode - node for the VoltageChartNode, if present
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
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

      // TODO: Use PressListener instead of SimpleDragHandler
      SimpleDragHandler.createForwardingListener( event => {

        // Select a non-visible meter node
        const meterNode = _.find( meterNodes, meterNode => !meterNode.visible );
        if ( meterNode ) {
          const meterModel = meterNode[ meterModelName ];
          const viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );
          meterModel.draggingProbesWithBodyProperty.value = true;
          meterModel.visibleProperty.value = true;
          meterModel.bodyPositionProperty.value = viewPosition;
          meterNode.startDrag( event );
        }
      }, {
        allowTouchSnag: true
      } );

    // Draggable isIcon for the voltmeter
    const voltmeter = new Voltmeter( Tandem.OPTIONAL );
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
    const ammeterToolNode = new AmmeterNode( ammeter, null, {
      isIcon: true,
      tandem: tandem.createTandem( 'ammeterToolNode' )
    } );
    const allAmmetersVisibleProperty = DerivedProperty.and( ammeterNodes.map( ammeterNode => ammeterNode.ammeter.visibleProperty ) );
    allAmmetersVisibleProperty.link( visible => ammeterToolNode.setVisible( !visible ) );
    ammeterToolNode.mutate( {
      scale: TOOLBOX_ICON_SIZE / Math.max( ammeterToolNode.width, ammeterToolNode.height )
    } );
    ammeterToolNode.addInputListener( createListenerMulti( ammeterNodes, 'ammeter' ) );

    // Icon for the series ammeter
    const seriesAmmeterIcon = new SeriesAmmeter(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CCKCConstants.SERIES_AMMETER_LENGTH, 0 ) ),
      Tandem.OPTIONAL
    );
    const seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeterIcon, tandem.createTandem( 'seriesAmmeterNodeIcon' ), {
      isIcon: true
    } );
    const createSeriesAmmeter = ( position, isIcon ) => {
      const halfLength = CCKCConstants.SERIES_AMMETER_LENGTH / 2;
      const startVertex = circuit.vertexGroup.createNextElement( position.plusXY( -halfLength, 0 ) );
      const endVertex = circuit.vertexGroup.createNextElement( position.plusXY( halfLength, 0 ) );
      return circuit.seriesAmmeterGroup.createNextElement( startVertex, endVertex );
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
        touchAreaExpansionBottom: 0,
        tandem: tandem.createTandem( 'seriesAmmeterToolNode' )
      } );

    // Labels underneath the sensor tool nodes
    const voltmeterText = new Text( voltmeterString, {
      maxWidth: 60,
      tandem: tandem.createTandem( 'voltmeterLabel' )
    } );
    const ammeterText = new Text( options.showSeriesAmmeters ? ammetersString : ammeterString, {
      maxWidth: 60,
      tandem: tandem.createTandem( 'ammeterLabel' )
    } );

    // Alter the visibility of the labels when the labels checkbox is toggled.
    circuitLayerNode.model.showLabelsProperty.linkAttribute( voltmeterText, 'visible' );
    circuitLayerNode.model.showLabelsProperty.linkAttribute( ammeterText, 'visible' );

    const voltmeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        voltmeterNodeIcon,
        voltmeterText
      ],
      excludeInvisibleChildrenFromBounds: false,
      tandem: tandem.createTandem( 'voltmeterToolIconWithLabel' )
    } );

    const children = [];
    options.showNoncontactAmmeters && children.push( ammeterToolNode );
    options.showSeriesAmmeters && children.push( seriesAmmeterToolNode );

    const ammeterToolIcon = new VBox( {
      spacing: ICON_TEXT_SPACING,
      children: [
        new HBox( {
          spacing: 8,
          align: 'bottom',
          children: children,
          excludeInvisibleChildrenFromBounds: false
        } ),
        ammeterText
      ],
      excludeInvisibleChildrenFromBounds: false,
      tandem: tandem.createTandem( 'ammeterToolIconWithLabel' )
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

circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );
export default SensorToolbox;