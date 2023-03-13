// Copyright 2016-2023, University of Colorado Boulder

/**
 * This is the toolbox on the right hand side from which the voltmeter and ammeter can be dragged/dropped.  Exists for
 * the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { AlignGroup, DragListener, HBox, HSeparator, Node, PressListenerEvent, Rectangle, Text, VBox } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Ammeter from '../model/Ammeter.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Vertex from '../model/Vertex.js';
import Voltmeter from '../model/Voltmeter.js';
import AmmeterNode from './AmmeterNode.js';
import CCKCPanel, { CCKCPanelOptions } from './CCKCPanel.js';
import CircuitElementToolNode from './CircuitElementToolNode.js';
import CurrentChartNode from './CurrentChartNode.js';
import SeriesAmmeterNode from './SeriesAmmeterNode.js';
import VoltageChartNode from './VoltageChartNode.js';
import VoltmeterNode from './VoltmeterNode.js';
import CircuitNode from './CircuitNode.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import optionize from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';

const ammetersStringProperty = CircuitConstructionKitCommonStrings.ammetersStringProperty;
const ammeterStringProperty = CircuitConstructionKitCommonStrings.ammeterStringProperty;
const currentChartStringProperty = CircuitConstructionKitCommonStrings.currentChartStringProperty;
const voltageChartStringProperty = CircuitConstructionKitCommonStrings.voltageChartStringProperty;
const voltmeterStringProperty = CircuitConstructionKitCommonStrings.voltmeterStringProperty;

// constants
const TOOLBOX_ICON_HEIGHT = 53;
const VOLTMETER_ICON_SCALE = 1.4;
const ICON_TEXT_SPACING = 3; // distance in view coordinates from the isIcon to the text below the isIcon

type SelfOptions = {
  showResultsProperty?: ReadOnlyProperty<boolean>;
  showSeriesAmmeters?: boolean;
  showNoncontactAmmeters?: boolean;
  showCharts?: boolean;
};
type SensorToolboxOptions = SelfOptions & CCKCPanelOptions;
export default class SensorToolbox extends CCKCPanel {

  /**
   * @param alignGroup - for alignment with other controls
   * @param circuitNode - the main circuit node to use as a coordinate frame
   * @param voltmeterNodes - nodes that display the Voltmeters
   * @param ammeterNodes - nodes that display the Ammeters
   * @param voltageChartNodes - nodes for the VoltageChartNode, if present
   * @param currentChartNodes - nodes for the CurrentChartNode, if present
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( alignGroup: AlignGroup, circuitNode: CircuitNode, voltmeterNodes: VoltmeterNode[],
                      ammeterNodes: AmmeterNode[], voltageChartNodes: VoltageChartNode[], currentChartNodes: CurrentChartNode[],
                      tandem: Tandem, providedOptions?: SensorToolboxOptions ) {
    const circuit = circuitNode.circuit;

    const options = optionize<SensorToolboxOptions, SelfOptions, CCKCPanelOptions>()( {
      showResultsProperty: circuitNode.model.isValueDepictionEnabledProperty,
      showSeriesAmmeters: true, // whether the series ammeters should be shown in the toolbox
      showNoncontactAmmeters: true, // whether the noncontact ammeters should be shown in the toolbox
      showCharts: false
    }, providedOptions );

    /**
     * @param meterNodes
     * @param meterModelName for looking up the corresponding models
     * @returns a listener
     */
    const createListenerMulti = ( meterNodes: ( VoltmeterNode[] | AmmeterNode[] | ( VoltageChartNode | CurrentChartNode )[] ) ): object =>

      DragListener.createForwardingListener( ( event: PressListenerEvent ) => {

        // Select a non-visible meter node
        const meterNode = _.find( meterNodes, ( meterNode: Node ) => !meterNode.visible ) as ( VoltmeterNode | AmmeterNode | VoltageChartNode | CurrentChartNode );
        if ( meterNode ) {
          const meterModel = meterNode instanceof VoltmeterNode ? meterNode.voltmeter :
                             meterNode instanceof AmmeterNode ? meterNode.ammeter :
                             meterNode.meter;
          const viewPosition = circuitNode.globalToLocalPoint( event.pointer.point );
          meterModel.isDraggingProbesWithBodyProperty.value = true;
          meterModel.isActiveProperty.value = true;
          meterModel.bodyPositionProperty.value = viewPosition;
          meterNode.startDrag( event );
        }
      }, {
        allowTouchSnag: true
      } );

    // Draggable isIcon for the voltmeter
    const voltmeter = new Voltmeter( Tandem.OPTIONAL, 0 );
    const voltmeterToolIcon = new VoltmeterNode( voltmeter, null, null, {
      tandem: Tandem.OPT_OUT,
      isIcon: true
    } );
    const allVoltmetersInPlayAreaProperty = DerivedProperty.and( voltmeterNodes.map( voltmeterNode => voltmeterNode.voltmeter.isActiveProperty ) );
    allVoltmetersInPlayAreaProperty.link( visible => voltmeterToolIcon.setVisible( !visible ) );
    voltmeterToolIcon.mutate( {
      scale: TOOLBOX_ICON_HEIGHT * VOLTMETER_ICON_SCALE / Math.max( voltmeterToolIcon.width, voltmeterToolIcon.height )
    } );
    voltmeterToolIcon.addInputListener( createListenerMulti( voltmeterNodes ) );

    // Icon for the ammeter
    const ammeter = new Ammeter( Tandem.OPTIONAL, 0 );
    const ammeterToolIcon = new AmmeterNode( ammeter, null, {
      isIcon: true,
      tandem: options.showNoncontactAmmeters ? tandem.createTandem( 'noncontactAmmeterToolNode' ) : Tandem.OPT_OUT,
      phetioVisiblePropertyInstrumented: true,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
    const allAmmetersInPlayAreaProperty = DerivedProperty.and( ammeterNodes.map( ammeterNode => ammeterNode.ammeter.isActiveProperty ) );
    allAmmetersInPlayAreaProperty.link( allInPlayArea => {

      // Simulate becoming visible: false, but without changing the dimensions
      ammeterToolIcon.setOpacity( allInPlayArea ? 0 : 1 );
      ammeterToolIcon.setInputEnabled( !allInPlayArea );
    } );
    ammeterToolIcon.mutate( {
      scale: TOOLBOX_ICON_HEIGHT / Math.max( ammeterToolIcon.width, ammeterToolIcon.height )
    } );
    ammeterToolIcon.addInputListener( createListenerMulti( ammeterNodes ) );

    // Icon for the series ammeter
    const seriesAmmeterIcon = new SeriesAmmeter(
      new Vertex( Vector2.ZERO, circuit.selectionProperty ),
      new Vertex( new Vector2( CCKCConstants.SERIES_AMMETER_LENGTH, 0 ), circuit.selectionProperty ),
      Tandem.OPTIONAL
    );
    const seriesAmmeterNodeIcon = new SeriesAmmeterNode( null, null, seriesAmmeterIcon,
      Tandem.OPT_OUT, options.showResultsProperty, {
        isIcon: true
      } );

    const createSeriesAmmeter = ( position: Vector2 ) => {
      const halfLength = CCKCConstants.SERIES_AMMETER_LENGTH / 2;
      const startVertex = circuit.vertexGroup.createNextElement( position.plusXY( -halfLength, 0 ) );
      const endVertex = circuit.vertexGroup.createNextElement( position.plusXY( halfLength, 0 ) );
      return circuit.seriesAmmeterGroup!.createNextElement( startVertex, endVertex );
    };
    seriesAmmeterNodeIcon.mutate( { scale: TOOLBOX_ICON_HEIGHT / seriesAmmeterNodeIcon.width } );
    const MAX_SERIES_AMMETERS = 6;

    // This is the real tool node
    const seriesAmmeterToolNode = new CircuitElementToolNode(
      new Property( '' ),
      new BooleanProperty( false ),
      new EnumerationProperty( CircuitElementViewType.SCHEMATIC ),
      circuit,
      point => circuitNode.globalToLocalPoint( point ),
      seriesAmmeterNodeIcon,
      MAX_SERIES_AMMETERS,
      () => circuit.circuitElements.count( circuitElement => circuitElement instanceof SeriesAmmeter ),
      createSeriesAmmeter, {
        touchAreaExpansionLeft: 3,
        touchAreaExpansionTop: 15,
        touchAreaExpansionRight: 3,
        touchAreaExpansionBottom: 0,
        tandem: circuit.includeLabElements ? tandem.createTandem( 'seriesAmmeterToolNode' ) : Tandem.OPT_OUT,
        ghostOpacity: 0,
        visiblePropertyOptions: {
          phetioFeatured: true
        }
      } );
    const allSeriesAmmetersInPlayAreaProperty = new DerivedProperty( [ circuit.circuitElements.lengthProperty ], ( () => {
      return circuit.circuitElements.count( circuitElement => circuitElement instanceof SeriesAmmeter ) === MAX_SERIES_AMMETERS;
    } ) );

    // Labels underneath the sensor tool nodes
    const voltmeterText = new Text( voltmeterStringProperty, {
      maxWidth: 60,
      fill: CCKCColors.textFillProperty,
      tandem: tandem.createTandem( 'voltmeterText' ),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    } );
    const ammeterText = new Text( options.showSeriesAmmeters && options.showNoncontactAmmeters ? ammetersStringProperty : ammeterStringProperty, {
      maxWidth: 60,
      fill: CCKCColors.textFillProperty,
      tandem: tandem.createTandem( 'ammeterText' ),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    } );

    Multilink.multilink(
      [ circuitNode.model.showLabelsProperty, allAmmetersInPlayAreaProperty, allSeriesAmmetersInPlayAreaProperty, ammeterToolIcon.visibleProperty, seriesAmmeterNodeIcon.visibleProperty, seriesAmmeterToolNode.visibleProperty ],
      ( showLabels, allAmmetersInPlayArea, allSeriesAmmetersInPlayArea, ammeterToolNodeVisible, seriesAmmeterNodeIconVisible, seriesAmmeterToolNodeVisible ) => {

        ammeterText.visible = showLabels && (
          ( seriesAmmeterToolNodeVisible && options.showSeriesAmmeters ) ||
          ( ammeterToolNodeVisible && options.showNoncontactAmmeters )
        );
      } );

    const voltmeterToolNode = new VBox( {
      tandem: tandem.createTandem( 'voltmeterToolNode' ),
      spacing: ICON_TEXT_SPACING,
      children: [
        voltmeterToolIcon,
        voltmeterText
      ],
      excludeInvisibleChildrenFromBounds: false,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    // Alter the visibility of the labels when the labels checkbox is toggled.
    Multilink.multilink( [ circuitNode.model.showLabelsProperty, allVoltmetersInPlayAreaProperty, voltmeterToolNode.visibleProperty ],
      ( showLabels, allVoltmetersInPlayArea, voltmeterToolNodeVisible ) => {
        voltmeterText.visible = showLabels && voltmeterToolNodeVisible;
      } );

    // This provides some space above the series ammeter icon when all other meter icons are hidden
    const seriesAmmeterToolNodeContainer = new HBox( {
      topMargin: 10,
      children: [
        seriesAmmeterToolNode
      ]
    } );

    const ammeterToolNodeChildren = [];
    options.showNoncontactAmmeters && ammeterToolNodeChildren.push( ammeterToolIcon );
    options.showSeriesAmmeters && ammeterToolNodeChildren.push( seriesAmmeterToolNodeContainer );

    const ammeterToolNode = new VBox( {
      tandem: Tandem.OPT_OUT,
      spacing: ICON_TEXT_SPACING,
      children: [
        new HBox( {
          spacing: 8,
          align: 'bottom',
          children: ammeterToolNodeChildren,
          excludeInvisibleChildrenFromBounds: true
        } ),
        ammeterText
      ],
      excludeInvisibleChildrenFromBounds: false
    } );

    const topBox = alignGroup.createBox( new HBox( {
      spacing: ( options.showNoncontactAmmeters && options.showSeriesAmmeters ) ? 20 : 40,
      align: 'bottom',
      children: [ voltmeterToolNode, ammeterToolNode ]
    } ) );

    const rows: Node[] = [ topBox ];
    if ( options.showCharts ) {
      const everythingProperty = new Property( Bounds2.EVERYTHING );

      const createChartToolIcon = ( chartNodes: ( VoltageChartNode | CurrentChartNode )[], chartNodeIcon: VoltageChartNode | CurrentChartNode, labelNode: Text, tandem: Tandem ) => {

        // Rasterization comes out blurry, instead put an overlay to intercept input events.
        const overlay = Rectangle.bounds( chartNodeIcon.bounds, { fill: 'blue', opacity: 0 } );
        const container = new Node( {
          children: [ chartNodeIcon, overlay ],
          cursor: 'pointer'
        } );
        const chartToolIcon = new VBox( {
          spacing: ICON_TEXT_SPACING,
          children: [ container, labelNode ],
          tandem: tandem
        } );

        const allInPlayAreaProperty = DerivedProperty.and( chartNodes.map( chartNode => chartNode.meter.isActiveProperty ) );
        allInPlayAreaProperty.link( allInPlayArea => {
          chartNodeIcon.setVisible( !allInPlayArea );
          chartToolIcon.inputEnabledProperty.value = !allInPlayArea;
        } );
        overlay.addInputListener( createListenerMulti( chartNodes ) );

        // Alter the visibility of the labels when the labels checkbox is toggled.
        Multilink.multilink( [ circuitNode.model.showLabelsProperty, allInPlayAreaProperty ], ( showLabels, allInPlayArea ) => {
          labelNode.visible = showLabels && !allInPlayArea;
        } );

        return chartToolIcon;
      };

      // Make the voltage chart the same width as the voltmeter, since the icons will be aligned in a grid
      const voltageChartNodeIconContents = new VoltageChartNode( circuitNode, new NumberProperty( 0 ), everythingProperty );
      const scale = voltmeterToolNode.width / voltageChartNodeIconContents.width;
      voltageChartNodeIconContents.scale( scale );

      const voltageChartToolIcon = createChartToolIcon( voltageChartNodes,
        voltageChartNodeIconContents,
        new Text( voltageChartStringProperty, {
          maxWidth: 60,
          fill: CCKCColors.textFillProperty,
          visiblePropertyOptions: {
            phetioReadOnly: true
          }
        } ),
        tandem.createTandem( 'voltageChartToolIcon' )
      );
      const currentChartToolIcon = createChartToolIcon( currentChartNodes,
        new CurrentChartNode( circuitNode, new NumberProperty( 0 ), everythingProperty, { scale: scale, tandem: Tandem.OPT_OUT } ),
        new Text( currentChartStringProperty, {
          maxWidth: 60,
          fill: CCKCColors.textFillProperty,
          visiblePropertyOptions: {
            phetioReadOnly: true
          }
        } ),
        tandem.createTandem( 'currentChartToolIcon' )
      );
      voltageChartToolIcon.centerX = voltmeterToolNode.centerX;
      currentChartToolIcon.centerX = ammeterToolNode.centerX;
      const chartBox = new Node( {
        children: [ voltageChartToolIcon, currentChartToolIcon ]
      } );

      rows.push( new HSeparator() );
      rows.push( chartBox );
    }

    super( new VBox( {
      spacing: 5,
      children: rows
    } ), tandem, {
      yMargin: 8,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'SensorToolbox', SensorToolbox );