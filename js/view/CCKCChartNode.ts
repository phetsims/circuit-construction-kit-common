// Copyright 2019-2023, University of Colorado Boulder

/**
 * Provides simulation-specific values and customizations to display time-series data in a chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import CanvasLinePlot from '../../../bamboo/js/CanvasLinePlot.js';
import ChartCanvasNode from '../../../bamboo/js/ChartCanvasNode.js';
import ChartRectangle from '../../../bamboo/js/ChartRectangle.js';
import ChartTransform from '../../../bamboo/js/ChartTransform.js';
import CanvasGridLineSet from '../../../bamboo/js/CanvasGridLineSet.js';
import TickLabelSet from '../../../bamboo/js/TickLabelSet.js';
import ScatterPlot from '../../../bamboo/js/ScatterPlot.js';
import SpanNode from '../../../bamboo/js/SpanNode.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import MagnifyingGlassZoomButtonGroup from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import ShadedRectangle from '../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import { DragListener, Node, NodeOptions, PressListenerEvent, Text } from '../../../scenery/js/imports.js';
import ButtonNode from '../../../sun/js/buttons/ButtonNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import Meter from '../model/Meter.js';
import CCKCProbeNode from './CCKCProbeNode.js';
import CircuitNode from './CircuitNode.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import CCKCScreenView from './CCKCScreenView.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { ObservableArray } from '../../../axon/js/createObservableArray.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import TEmitter from '../../../axon/js/TEmitter.js';

const oneSecondStringProperty = CircuitConstructionKitCommonStrings.oneSecondStringProperty;
const timeStringProperty = CircuitConstructionKitCommonStrings.timeStringProperty;

// constants
const AXIS_LABEL_FILL = 'white';
const LABEL_FONT_SIZE = 14;

// For the wires
const NORMAL_DISTANCE = 25;
const WIRE_LINE_WIDTH = 3;

const MAX_AXIS_LABEL_WIDTH = 120;

type SelfOptions = {
  defaultZoomLevel?: Range;
};
export type CCKCChartNodeOptions = SelfOptions & NodeOptions & PickRequired<NodeOptions, 'tandem'>;

export default class CCKCChartNode extends Node {
  public readonly meter: Meter;
  protected readonly series: ObservableArray<Vector2 | null>;
  protected readonly circuitNode: CircuitNode;
  protected readonly timeProperty: Property<number>;
  private readonly visibleBoundsProperty: Property<Bounds2>;
  private readonly backgroundNode: Node;
  private backgroundDragListener: DragListener | null;

  // emits when the probes should be put in standard relative position to the body
  private readonly alignProbesEmitter: TEmitter;

  // emits when the CCKCChartNode has been dropped
  private readonly droppedEmitter: TEmitter;
  protected readonly aboveBottomLeft1Property: TReadOnlyProperty<Vector2>;
  protected readonly aboveBottomLeft2Property: TReadOnlyProperty<Vector2>;
  private readonly zoomLevelProperty: NumberProperty;
  protected readonly updatePen: () => void;

  /**
   * @param circuitNode
   * @param timeProperty
   * @param visibleBoundsProperty
   * @param series
   * @param verticalAxisLabel
   * @param [providedOptions]
   */
  public constructor( circuitNode: CircuitNode, timeProperty: Property<number>, visibleBoundsProperty: Property<Bounds2>,
                      series: ObservableArray<Vector2 | null>, verticalAxisLabel: TReadOnlyProperty<string>, providedOptions?: CCKCChartNodeOptions ) {
    const options = optionize<CCKCChartNodeOptions, SelfOptions, NodeOptions>()( {
      defaultZoomLevel: new Range( -2, 2 ),

      // Prevent adjustment of the control panel rendering while dragging,
      // see https://github.com/phetsims/wave-interference/issues/212
      preventFit: true
    }, providedOptions ) as CCKCChartNodeOptions;
    const backgroundNode = new Node( { cursor: 'pointer' } );

    super();

    const tandem = options.tandem;

    this.meter = new Meter( tandem.createTandem( 'meter' ), 0 );
    this.series = series;
    this.circuitNode = circuitNode;
    this.timeProperty = timeProperty;
    this.visibleBoundsProperty = visibleBoundsProperty;

    // shows the background for the chart.  Any attached probes or other
    // supplemental nodes should not be children of the backgroundNode if they need to translate independently.
    this.backgroundNode = backgroundNode;

    // set in initializeBodyDragListener
    this.backgroundDragListener = null;

    this.addChild( this.backgroundNode );

    // Mutate after backgroundNode is added as a child
    this.mutate( options );

    this.alignProbesEmitter = new Emitter();

    // These do not need to be disposed because there is no connection to the "outside world"
    const leftBottomProperty = new DerivedProperty( [ backgroundNode.boundsProperty ], bounds => bounds.leftBottom );

    this.droppedEmitter = new Emitter();

    // for attaching probes
    this.aboveBottomLeft1Property = new DerivedProperty(
      [ leftBottomProperty ],
      ( position: Vector2 ) => position.isFinite() ? position.plusXY( 0, -20 ) : Vector2.ZERO
    );

    // for attaching probes
    this.aboveBottomLeft2Property = new DerivedProperty(
      [ leftBottomProperty ],
      ( position: Vector2 ) => position.isFinite() ? position.plusXY( 0, -10 ) : Vector2.ZERO
    );

    const chartTransform = new ChartTransform( {
      viewWidth: 150,
      viewHeight: 100,
      modelXRange: new Range( 0, 4.25 ),
      modelYRange: new Range( -2, 2 )
    } );
    const chartBackground = new ChartRectangle( chartTransform, {
      fill: 'white',
      cornerXRadius: 6,
      cornerYRadius: 6
    } );

    const horizontalAxisTitleNode = new Text( timeStringProperty, {
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      centerTop: chartBackground.centerBottom.plusXY( 0, 5 ),
      maxWidth: MAX_AXIS_LABEL_WIDTH
    } );
    const scaleIndicatorText = new Text( oneSecondStringProperty, {
      fontSize: 11,
      fill: 'white'
    } );

    const zoomRanges = [
      new Range( -1200, 1200 ),
      new Range( -1000, 1000 ),
      new Range( -800, 800 ),
      new Range( -600, 600 ),
      new Range( -400, 400 ),
      new Range( -200, 200 ),
      new Range( -150, 150 ),
      new Range( -100, 100 ),
      new Range( -50, 50 ),
      new Range( -20, 20 ),
      new Range( -10, 10 ),
      new Range( -2, 2 ),
      new Range( -0.4, 0.4 )
    ];
    const initialZoomIndex = zoomRanges.findIndex( e => e.equals( options.defaultZoomLevel ) );

    this.zoomLevelProperty = new NumberProperty( initialZoomIndex, {
      range: new Range( 0, zoomRanges.length - 1 ),
      tandem: tandem.createTandem( 'zoomLevelProperty' )
    } );

    const gridLineOptions = {
      stroke: 'lightGray',
      lineDash: [ 5, 5 ],
      lineWidth: 0.8,
      lineDashOffset: 5 / 2
    };

    const horizontalGridLineSet = new CanvasGridLineSet( chartTransform, Orientation.HORIZONTAL, 1, gridLineOptions );
    const verticalGridLineSet = new CanvasGridLineSet( chartTransform, Orientation.VERTICAL, 1, gridLineOptions );
    const verticalLabelSet = new TickLabelSet( chartTransform, Orientation.VERTICAL, 1, {
      edge: 'min',
      extent: 1.5,
      createLabel: ( value: number ) => new Text( Utils.toFixed( value, this.zoomLevelProperty.value === zoomRanges.length - 1 ? 1 : 0 ), {
        fontSize: 10,
        fill: 'white'
      } )
    } );

    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.zoomLevelProperty, {
      orientation: 'vertical',
      left: chartBackground.right + 2,
      top: chartBackground.top,
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      magnifyingGlassNodeOptions: {
        glassRadius: 10,
        maxWidth: 15
      },
      buttonOptions: {
        baseColor: 'white',
        buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
        cornerRadius: 0,
        xMargin: 3,
        yMargin: 3
      },
      tandem: tandem.createTandem( 'zoomButtonGroup' )
    } );
    this.zoomLevelProperty.link( zoomLevel => {
      chartTransform.setModelYRange( zoomRanges[ zoomLevel ] );
      verticalGridLineSet.setSpacing( zoomRanges[ zoomLevel ].max / 2 );
      verticalLabelSet.setSpacing( zoomRanges[ zoomLevel ].max / 2 );
    } );

    const penData = [ new Vector2( 0, 0 ) ];

    const pen = new ScatterPlot( chartTransform, penData, {
      fill: '#717274',
      stroke: '#717274',
      radius: 4
    } );

    this.updatePen = () => {
      penData[ 0 ].x = timeProperty.value;
      const length = series.length;
      if ( length > 0 ) {
        const point = series[ length - 1 ];
        penData[ 0 ].y = point === null ? 0 : point.y;
      }
      else {
        penData[ 0 ].y = 0;
      }
      pen.update();
    };

    timeProperty.link( time => {

      // Show 4 seconds, plus a lead time of 0.25 sec
      chartTransform.setModelXRange( new Range( time - 4, time + 0.25 ) );

      verticalGridLineSet.setLineDashOffset( time * chartTransform.modelToViewDelta( Orientation.HORIZONTAL, 1 ) );
      this.updatePen();
    } );

    const linePlot = new ChartCanvasNode( chartTransform, [

      horizontalGridLineSet,
      verticalGridLineSet,

      new CanvasLinePlot( chartTransform, series, {
        stroke: '#717274',
        lineWidth: 1.5
      } ) ] );

    // Show a text message when there is data, but none of the data is in range.
    const dataOutOfRangeMessage = new Text( CircuitConstructionKitCommonStrings.dataOutOfRangeStringProperty, {
      fill: 'red',
      centerX: linePlot.centerX,
      centerY: linePlot.centerY,
      fontSize: 13,
      maxWidth: chartTransform.viewWidth - 20
    } );

    const updateDataOutOfRangeMessage = () => {
      let showOutOfRangeMessage = true;

      // If any point is in the displayed range, we don't want to show the data out of range message
      series.forEach( point => {
        if ( point && chartTransform.modelXRange.contains( point.x ) && chartTransform.modelYRange.contains( point.y ) ) {
          showOutOfRangeMessage = false;
        }
      } );

      // This is the same as the logic in updatePen.  If the pen is shown at 0, then we don't want to display the
      // data out of range message
      const lastPointIsNull = series.length > 0 && series[ series.length - 1 ] === null;
      if ( lastPointIsNull || series.length === 0 ) {
        showOutOfRangeMessage = false;
      }
      dataOutOfRangeMessage.setVisible( showOutOfRangeMessage );
    };
    updateDataOutOfRangeMessage();
    series.addItemAddedListener( () => {
      linePlot.update();
      this.updatePen();
      updateDataOutOfRangeMessage();
    } );
    series.addItemRemovedListener( () => {
      linePlot.update();
      this.updatePen();
      updateDataOutOfRangeMessage();
    } );

    // Anything you want clipped goes in here
    const chartClip = new Node( {
      clipArea: chartBackground.getShape(),
      children: [
        linePlot,
        dataOutOfRangeMessage,
        pen
      ]
    } );

    const verticalAxisTitleNode = new Text( verticalAxisLabel, {
      rotation: -Math.PI / 2,
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      rightCenter: verticalLabelSet.leftCenter.plusXY( -10, 0 ),
      maxWidth: MAX_AXIS_LABEL_WIDTH
    } );

    const spanNode = new SpanNode( chartTransform, Orientation.HORIZONTAL, 1, scaleIndicatorText, {
      color: 'white',
      left: chartBackground.left,
      top: chartBackground.bottom + 3
    } );
    const chartNode = new Node( {
      children: [
        chartBackground,
        chartClip,
        zoomButtonGroup,
        verticalAxisTitleNode,
        horizontalAxisTitleNode,
        verticalLabelSet,
        spanNode
      ]
    } );

    // Forbid overlap between the horizontal axis label and the span node
    const padding = 5;
    if ( horizontalAxisTitleNode.left < spanNode.right + padding ) {
      horizontalAxisTitleNode.left = spanNode.right + padding;
    }

    const shadedRectangle = new ShadedRectangle( chartNode.bounds.dilated( 7 ), {
      baseColor: '#327198'
    } );
    shadedRectangle.addChild( chartNode );
    backgroundNode.addChild( shadedRectangle );

    this.meter.isActiveProperty.link( isActive => this.setVisible( isActive ) );
    this.meter.bodyPositionProperty.link( bodyPosition => backgroundNode.setCenter( bodyPosition ) );
  }

  /**
   * @param color
   * @param wireColor
   * @param dx - initial relative x coordinate for the probe
   * @param dy - initial relative y coordinate for the probe
   * @param connectionProperty
   * @param tandem
   */
  protected addProbeNode( color: string, wireColor: string, dx: number, dy: number, connectionProperty: TReadOnlyProperty<Vector2>, tandem: Tandem ): CCKCProbeNode {
    const probeNode = new CCKCProbeNode( this, this.visibleBoundsProperty, { color: color, tandem: tandem } );

    // Add the wire behind the probe.
    this.addChild( new WireNode( connectionProperty, new Vector2Property( new Vector2( -NORMAL_DISTANCE, 0 ) ),
      new DerivedProperty( [ probeNode.boundsProperty ], bounds => bounds.centerBottom ), new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) ), {
        lineWidth: WIRE_LINE_WIDTH,
        stroke: wireColor
      }
    ) );
    this.addChild( probeNode );

    // Standard position in toolbox and when dragging out of toolbox.
    const alignProbes = () => {
      probeNode.mutate( {
        right: this.backgroundNode.left - dx,
        top: this.backgroundNode.top + dy
      } );

      // Prevent the probes from going out of the visible bounds when tagging along with the dragged CCKCChartNode
      probeNode.translation = this.visibleBoundsProperty.value.closestPointTo( probeNode.translation );
    };
    this.visibleProperty.link( alignProbes );
    this.alignProbesEmitter.addListener( alignProbes );
    return probeNode;
  }

  /**
   * Clear the data from the chart.
   */
  public reset(): void {
    this.series.clear();
    this.meter.reset();
    this.zoomLevelProperty.reset();
  }

  /**
   * Gets the region of the background in global coordinates.  This can be used to determine if the chart
   * should be dropped back in a toolbox.
   */
  private getBackgroundNodeGlobalBounds(): Bounds2 {
    return this.localToGlobalBounds( this.backgroundNode.bounds );
  }

  /**
   * Forward an event from the toolbox to start dragging the node in the play area.  This triggers the probes (if any)
   * to drag together with the chart.  This is accomplished by calling this.alignProbes() at each drag event.
   */
  public startDrag( event: PressListenerEvent ): void {

    // Forward the event to the drag listener
    this.backgroundDragListener && this.backgroundDragListener.press( event );
  }

  /**
   * For a CCKCChartNode that is not an icon, add a listener that
   * (1) drags the body
   * (2) constrains the drag to the screenView bounds
   * (3) drops back into the toolbox
   */
  public initializeBodyDragListener( screenView: CCKCScreenView ): void {

    // Since this will be shown from the toolbox, make the play area icon invisible and prepare to drag with probes
    this.meter.isActiveProperty.value = false;
    this.meter.isDraggingProbesWithBodyProperty.value = true;

    const dragBoundsProperty = new Property<Bounds2 | null>( null );

    const dragListener = new DragListener( {
      allowTouchSnag: false, // allow the zoom buttons to be pressed with the mouse
      positionProperty: this.meter.bodyPositionProperty,
      useParentOffset: true,
      dragBoundsProperty: dragBoundsProperty,

      // adds support for zoomed coordinate frame, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/301
      targetNode: this,
      tandem: this.tandem.createTandem( 'dragListener' ),
      start: () => {
        this.moveToFront();
        if ( this.meter.isDraggingProbesWithBodyProperty.value ) {

          // Align the probes each time the chart translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      drag: () => {
        if ( this.meter.isDraggingProbesWithBodyProperty.value ) {

          // Align the probes each time the chart translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      end: () => {

        // Drop in the toolbox if the center of the chart is within the sensor toolbox bounds
        if ( screenView.sensorToolbox.globalBounds.containsPoint( this.getBackgroundNodeGlobalBounds().center ) ) {
          this.alignProbesEmitter.emit();
          this.reset();
        }

        // Move probes to center line (if water side view model)
        this.droppedEmitter.emit();
        this.meter.isDraggingProbesWithBodyProperty.value = false;
      }
    } );

    const update = () => {
      const bounds = screenView.visibleBoundsProperty.value.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      const globalBounds = screenView.localToGlobalBounds( bounds );
      dragBoundsProperty.value = this.globalToParentBounds( globalBounds );
      this.meter.bodyPositionProperty.value = dragBoundsProperty.value.closestPointTo( this.meter.bodyPositionProperty.value );
    };
    screenView.visibleBoundsProperty.link( update );

    this.circuitNode.transformEmitter.addListener( update );
    this.backgroundDragListener = dragListener;
    this.backgroundNode.addInputListener( dragListener );
  }
}

circuitConstructionKitCommon.register( 'CCKCChartNode', CCKCChartNode );