// Copyright 2019-2021, University of Colorado Boulder

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
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import MagnifyingGlassZoomButtonGroup from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import ShadedRectangle from '../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import NodeProperty from '../../../scenery/js/util/NodeProperty.js';
import ButtonNode from '../../../sun/js/buttons/ButtonNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import Meter from '../model/Meter.js';
import CCKCProbeNode from './CCKCProbeNode.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import CCKCScreenView from './CCKCScreenView.js';

const oneSecondString = circuitConstructionKitCommonStrings.oneSecond;
const timeString = circuitConstructionKitCommonStrings.time;

// constants
const AXIS_LABEL_FILL = 'white';
const LABEL_FONT_SIZE = 14;

// For the wires
const NORMAL_DISTANCE = 25;
const WIRE_LINE_WIDTH = 3;

const MAX_AXIS_LABEL_WIDTH = 120;

type CCKCChartNodeOptions = {
  defaultZoomLevel: number
} & NodeOptions;

class CCKCChartNode extends Node {
  protected readonly meter: Meter;
  protected readonly series: ObservableArray<Vector2 | null>;
  protected readonly circuitLayerNode: CircuitLayerNode;
  protected readonly timeProperty: Property<number>;
  private readonly visibleBoundsProperty: Property<Bounds2>;
  private readonly backgroundNode: Node;
  private backgroundDragListener: DragListener | null;
  private readonly alignProbesEmitter: Emitter<[]>;
  private readonly droppedEmitter: Emitter<[]>;
  protected readonly aboveBottomLeft1: DerivedProperty<Vector2>;
  protected readonly aboveBottomLeft2: DerivedProperty<Vector2>;
  private readonly zoomLevelProperty: NumberProperty;
  protected readonly updatePen: () => void;

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Property.<number>} timeProperty
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {ObservableArrayDef.<Vector2|null>} series
   * @param {string} verticalAxisLabel
   * @param {Object} [options]
   */
  constructor( circuitLayerNode: CircuitLayerNode, timeProperty: Property<number>, visibleBoundsProperty: Property<Bounds2>,
               series: ObservableArray<Vector2 | null>, verticalAxisLabel: string, options?: Partial<CCKCChartNodeOptions> ) {
    const filledOptions = merge( {
      defaultZoomLevel: new Range( -2, 2 ),

      // Prevent adjustment of the control panel rendering while dragging,
      // see https://github.com/phetsims/wave-interference/issues/212
      preventFit: true,
      tandem: Tandem.OPTIONAL
    }, options ) as CCKCChartNodeOptions;
    const backgroundNode = new Node( { cursor: 'pointer' } );

    super();

    // @public {Meter}
    this.meter = new Meter( filledOptions.tandem.createTandem( 'meter' ), 0 );

    // @protected {ObservableArrayDef.<Vector2|null>}
    this.series = series;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // @private
    this.timeProperty = timeProperty;

    // @private
    this.visibleBoundsProperty = visibleBoundsProperty;

    // @public (read-only) {Node} - shows the background for the chart.  Any attached probes or other
    // supplemental nodes should not be children of the backgroundNode if they need to translate independently.
    this.backgroundNode = backgroundNode;

    // @private {DragListener|null} - set in initializeBodyDragListener
    this.backgroundDragListener = null;

    this.addChild( this.backgroundNode );

    // Mutate after backgroundNode is added as a child
    this.mutate( filledOptions );

    // @public - emits when the probes should be put in standard relative position to the body
    this.alignProbesEmitter = new Emitter();

    // These do not need to be disposed because there is no connection to the "outside world"
    const leftBottomProperty = new NodeProperty( backgroundNode, backgroundNode.boundsProperty, 'leftBottom' );

    // @public - emits when the CCKCChartNode has been dropped
    this.droppedEmitter = new Emitter();

    // @protected - for attaching probes
    this.aboveBottomLeft1 = new DerivedProperty(
      [ leftBottomProperty ],
      ( position: Vector2 ) => position.isFinite() ? position.plusXY( 0, -20 ) : Vector2.ZERO
    );

    // @protected - for attaching probes
    this.aboveBottomLeft2 = new DerivedProperty(
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

    const horizontalAxisTitleNode = new Text( timeString, {
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      centerTop: chartBackground.centerBottom.plusXY( 0, 5 ),
      maxWidth: MAX_AXIS_LABEL_WIDTH
    } );
    const scaleIndicatorText = new Text( oneSecondString, {
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
    const initialZoomIndex = zoomRanges.findIndex( e => e.equals( filledOptions.defaultZoomLevel ) );

    // @private
    this.zoomLevelProperty = new NumberProperty( initialZoomIndex, { range: new Range( 0, zoomRanges.length - 1 ) } );

    const gridLineOptions = {
      stroke: 'lightGray',
      lineDash: [ 5, 5 ],
      lineWidth: 0.8,
      lineDashOffset: 5 / 2
    };

    // @ts-ignore
    const horizontalGridLineSet = new CanvasGridLineSet( chartTransform, Orientation.HORIZONTAL, 1, gridLineOptions );
    // @ts-ignore
    const verticalGridLineSet = new CanvasGridLineSet( chartTransform, Orientation.VERTICAL, 1, gridLineOptions );
    // @ts-ignore
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
      tandem: filledOptions.tandem.createTandem( 'zoomButtonGroup' )
    } );
    this.zoomLevelProperty.link( ( zoomLevel: number ) => {
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

    // @public
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

    timeProperty.link( ( time: number ) => {

      // Show 4 seconds, plus a lead time of 0.25 sec
      chartTransform.setModelXRange( new Range( time - 4, time + 0.25 ) );

      // @ts-ignore
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

    series.addItemAddedListener( () => {
      linePlot.update();
      this.updatePen();
    } );
    series.addItemRemovedListener( () => {
      linePlot.update();
      this.updatePen();
    } );

    // Anything you want clipped goes in here
    const chartClip = new Node( {
      clipArea: chartBackground.getShape(),
      children: [
        linePlot,
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

    // @ts-ignore
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

    this.meter.visibleProperty.link( ( visible: boolean ) => this.setVisible( visible ) );
    this.meter.bodyPositionProperty.link( ( bodyPosition: Vector2 ) => backgroundNode.setCenter( bodyPosition ) );
  }

  /**
   * @param {Color|string} color
   * @param {Color|string} wireColor
   * @param {number} dx - initial relative x coordinate for the probe
   * @param {number} dy - initial relative y coordinate for the probe
   * @param {Property.<Vector2>} connectionProperty
   * @param {Tandem} tandem
   * @returns {CCKCProbeNode}
   * @protected
   */
  addProbeNode( color: string, wireColor: string, dx: number, dy: number, connectionProperty: Property<Vector2>, tandem: Tandem ) {
    const probeNode = new CCKCProbeNode( this, this.visibleBoundsProperty, { color: color, tandem: tandem } );

    // Add the wire behind the probe.
    this.addChild( new WireNode( connectionProperty, new Vector2Property( new Vector2( -NORMAL_DISTANCE, 0 ) ),
      new NodeProperty( probeNode, probeNode.boundsProperty, 'centerBottom' ), new Vector2Property( new Vector2( 0, NORMAL_DISTANCE ) ), {
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
   * @public
   */
  reset() {
    this.series.clear();
    this.meter.reset();
    this.zoomLevelProperty.reset();
  }

  /**
   * Gets the region of the background in global coordinates.  This can be used to determine if the chart
   * should be dropped back in a toolbox.
   * @returns {Bounds2}
   * @public
   */
  getBackgroundNodeGlobalBounds() {
    return this.localToGlobalBounds( this.backgroundNode.bounds );
  }

  /**
   * Forward an event from the toolbox to start dragging the node in the play area.  This triggers the probes (if any)
   * to drag together with the chart.  This is accomplished by calling this.alignProbes() at each drag event.
   * @param {SceneryEvent} event
   * @public
   */
  startDrag( event: SceneryEvent ) {

    // Forward the event to the drag listener
    this.backgroundDragListener && this.backgroundDragListener.press( event );
  }

  /**
   * For a CCKCChartNode that is not an icon, add a listener that
   * (1) drags the body
   * (2) constrains the drag to the screenView bounds
   * (3) drops back into the toolbox
   * @param {CCKCScreenView} screenView
   * @public
   */
  initializeBodyDragListener( screenView: CCKCScreenView ) {

    // Since this will be shown from the toolbox, make the play area icon invisible and prepare to drag with probes
    this.meter.visibleProperty.value = false;
    this.meter.draggingProbesWithBodyProperty.value = true;

    const dragListener = new DragListener( {
      positionProperty: this.meter.bodyPositionProperty,
      useParentOffset: true,

      // adds support for zoomed coordinate frame, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/301
      targetNode: this,
      tandem: this.tandem.createTandem( 'dragHandler' ),
      start: () => {
        this.moveToFront();
        if ( this.meter.draggingProbesWithBodyProperty.value ) {

          // Align the probes each time the chart translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      drag: () => {
        if ( this.meter.draggingProbesWithBodyProperty.value ) {

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
        this.meter.draggingProbesWithBodyProperty.value = false;
      }
    } );

    const update = () => {
      const bounds = screenView.visibleBoundsProperty.value.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      const globalBounds = screenView.localToGlobalBounds( bounds );
      dragListener.dragBounds = this.globalToParentBounds( globalBounds );
      this.meter.bodyPositionProperty.value = dragListener.dragBounds.closestPointTo( this.meter.bodyPositionProperty.value );
    };
    screenView.visibleBoundsProperty.link( update );

    this.circuitLayerNode.transformEmitter.addListener( update );
    this.backgroundDragListener = dragListener;
    this.backgroundNode.addInputListener( dragListener );
  }
}

circuitConstructionKitCommon.register( 'CCKCChartNode', CCKCChartNode );
export default CCKCChartNode;
