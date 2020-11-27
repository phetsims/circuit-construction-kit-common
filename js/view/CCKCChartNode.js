// Copyright 2019-2020, University of Colorado Boulder

/**
 * Provides simulation-specific values and customizations to display time-series data in a MeterBodyNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import ChartModel from '../../../bamboo/js/ChartModel.js';
import ChartRectangle from '../../../bamboo/js/ChartRectangle.js';
import GridLineSet from '../../../bamboo/js/GridLineSet.js';
import LabelSet from '../../../bamboo/js/LabelSet.js';
import LinePlot from '../../../bamboo/js/LinePlot.js';
import ScatterPlot from '../../../bamboo/js/ScatterPlot.js';
import SpanNode from '../../../bamboo/js/SpanNode.js';
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import ShadedRectangle from '../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import ZoomButtonGroup from '../../../scenery-phet/js/ZoomButtonGroup.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import NodeProperty from '../../../scenery/js/util/NodeProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Meter from '../model/Meter.js';
import CCKCProbeNode from './CCKCProbeNode.js';

const oneSecondString = circuitConstructionKitCommonStrings.oneSecond;
const timeString = circuitConstructionKitCommonStrings.time;

// constants
const AXIS_LABEL_FILL = 'white';
const LABEL_FONT_SIZE = 14;

// For the wires
const NORMAL_DISTANCE = 25;
const WIRE_LINE_WIDTH = 3;

class CCKCChartNode extends Node {

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {NumberProperty} timeProperty
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {DynamicSeries[]} seriesArray - TODO: Do we still want to use DynamicSeries?
   * @param {string} verticalAxisLabel
   * @param {Object} [options]
   */
  constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, seriesArray, verticalAxisLabel, options ) {
    options = merge( {

      // Prevent adjustment of the control panel rendering while dragging,
      // see https://github.com/phetsims/wave-interference/issues/212
      preventFit: true,
      tandem: Tandem.OPTIONAL
    }, options );
    const backgroundNode = new Node( { cursor: 'pointer' } );

    super();

    this.meter = new Meter( options.tandem.createTandem( 'meter' ) );

    // @private
    this.seriesArray = seriesArray;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // @private
    this.timeProperty = timeProperty;

    // @private
    this.visibleBoundsProperty = visibleBoundsProperty;

    // @public (read-only) {Node} - shows the background for the MeterBodyNode.  Any attached probes or other
    // supplemental nodes should not be children of the backgroundNode if they need to translate independently.
    this.backgroundNode = backgroundNode;

    // @private {DragListener} - set in initializeBodyDragListener
    this.backgroundDragListener = null;

    this.addChild( this.backgroundNode );

    // Mutate after backgroundNode is added as a child
    this.mutate( options );

    // @public - emits when the probes should be put in standard relative position to the body
    this.alignProbesEmitter = new Emitter();

    // These do not need to be disposed because there is no connection to the "outside world"
    const leftBottomProperty = new NodeProperty( backgroundNode, backgroundNode.boundsProperty, 'leftBottom' );

    // @public - emits when the CCKCChartNode has been dropped
    this.droppedEmitter = new Emitter();

    // @protected - for attaching probes
    this.aboveBottomLeft1 = new DerivedProperty(
      [ leftBottomProperty ],
      position => position.isFinite() ? position.plusXY( 0, -20 ) : Vector2.ZERO
    );

    // @protected - for attaching probes
    this.aboveBottomLeft2 = new DerivedProperty(
      [ leftBottomProperty ],
      position => position.isFinite() ? position.plusXY( 0, -10 ) : Vector2.ZERO
    );

    const chartModel = new ChartModel( 150, 100, {
      modelXRange: new Range( 0, 4.25 ),
      modelYRange: new Range( -2, 2 )
    } );
    const chartBackground = new ChartRectangle( chartModel, {
      fill: 'white',
      cornerXRadius: 6,
      cornerYRadius: 6
    } );

    const horizontalAxisTitleNode = new Text( timeString, {
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      centerTop: chartBackground.centerBottom.plusXY( 0, 5 )
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
      new Range( -2, 2 ), // default
      new Range( -0.4, 0.4 )
    ];
    const zoomLevelProperty = new NumberProperty( zoomRanges.length - 2, { range: new Range( 0, zoomRanges.length - 1 ) } );

    const gridLineOptions = {
      stroke: 'lightGray',
      lineDash: [ 5, 5 ],
      lineWidth: 0.8,
      lineDashOffset: 5 / 2
    };

    const horizontalGridLineSet = new GridLineSet( chartModel, Orientation.HORIZONTAL, 1, gridLineOptions );
    const verticalGridLineSet = new GridLineSet( chartModel, Orientation.VERTICAL, 1, gridLineOptions );

    const verticalLabelSet = new LabelSet( chartModel, Orientation.VERTICAL, 1, {
      edge: 'min',
      extent: 1.5,
      createLabel: value => new Text( value.toFixed( zoomLevelProperty.value === zoomRanges.length - 1 ? 1 : 0 ), {
        fontSize: 10,
        fill: 'white'
      } )
    } );

    const zoomButtonGroup = new ZoomButtonGroup( zoomLevelProperty, {
      orientation: 'vertical',
      left: chartBackground.right + 2,
      top: chartBackground.top
    } );
    zoomLevelProperty.link( zoomLevel => {
      chartModel.setModelYRange( zoomRanges[ zoomLevel ] );
      verticalGridLineSet.setSpacing( zoomRanges[ zoomLevel ].max / 2 );
      verticalLabelSet.setSpacing( zoomRanges[ zoomLevel ].max / 2 );
    } );

    const penData = [ new Vector2( 0, 0 ) ];

    const pen = new ScatterPlot( chartModel, penData, {
      fill: '#717274',
      stroke: '#717274',
      radius: 4
    } );
    const updatePen = () => {
      penData[ 0 ].x = timeProperty.value;
      const length = seriesArray[ 0 ].data.length;
      if ( length > 0 ) {
        const y = seriesArray[ 0 ].data[ length - 1 ].y;
        penData[ 0 ].y = isNaN( y ) ? 0 : y;
      }
      else {
        penData[ 0 ].y = 0;
      }
      pen.update();
    };
    timeProperty.link( time => {

      // Show 4 seconds, plus a lead time of 0.25 sec
      chartModel.setModelXRange( new Range( time - 4, time + 0.25 ) );
      verticalGridLineSet.setLineDashOffset( time * chartModel.modelToViewDelta( Orientation.HORIZONTAL, 1 ) );
      updatePen();
    } );

    const linePlot = new LinePlot( chartModel, seriesArray[ 0 ].data, {
      stroke: '#717274',
      lineWidth: 1.5
    } );

    seriesArray[ 0 ].addDynamicSeriesListener( () => {
      linePlot.update();
      updatePen();
    } );

    // Anything you want clipped goes in here
    const chartClip = new Node( {
      clipArea: chartBackground.getShape(),
      children: [

        // Minor grid lines
        horizontalGridLineSet,
        verticalGridLineSet,

        linePlot,
        pen
      ]
    } );

    const verticalAxisTitleNode = new Text( verticalAxisLabel, {
      rotation: -Math.PI / 2,
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL,
      rightCenter: verticalLabelSet.leftCenter.plusXY( -10, 0 )
    } );
    const chartNode = new Node( {
      children: [
        chartBackground,
        chartClip,
        zoomButtonGroup,
        verticalAxisTitleNode,
        horizontalAxisTitleNode,
        verticalLabelSet,
        new SpanNode( scaleIndicatorText, chartModel.modelToViewDelta( Orientation.HORIZONTAL, 1 ), {
          left: chartBackground.left,
          top: chartBackground.bottom + 3
        } )
      ]
    } );

    const shadedRectangle = new ShadedRectangle( chartNode.bounds.dilated( 7 ), {
      baseColor: '#327198'
    } );
    shadedRectangle.addChild( chartNode );
    backgroundNode.addChild( shadedRectangle );

    this.meter.visibleProperty.link( visible => this.setVisible( visible ) );
    this.meter.bodyPositionProperty.link( bodyPosition => backgroundNode.setCenter( bodyPosition ) );
  }

  /**
   * @param {Color|string} color
   * @param {Color|string} wireColor
   * @param {number} dx - initial relative x coordinate for the probe
   * @param {number} dy - initial relative y coordinate for the probe
   * @param {Property.<Vector2>} connectionProperty
   * @param {Tandem} tandem
   * @returns {DynamicSeries}
   * @protected
   */
  addProbeNode( color, wireColor, dx, dy, connectionProperty, tandem ) {

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
    this.visibleProperty.lazyLink( alignProbes );
    this.alignProbesEmitter.addListener( alignProbes );
    return probeNode;
  }

  /**
   * Clear the data from the chart.
   * @public
   */
  reset() {
    this.seriesArray.forEach( series => series.clear() );
    this.meter.reset();
  }

  /**
   * Gets the region of the background in global coordinates.  This can be used to determine if the MeterBodyNode
   * should be dropped back in a toolbox.
   * @returns {Bounds2}
   * @public
   */
  getBackgroundNodeGlobalBounds() {
    return this.localToGlobalBounds( this.backgroundNode.bounds );
  }

  /**
   * Forward an event from the toolbox to start dragging the node in the play area.  This triggers the probes (if any)
   * to drag together with the MeterBodyNode.  This is accomplished by calling this.alignProbes() at each drag event.
   * @param {Object} event
   * @public
   */
  startDrag( event ) {

    // Forward the event to the drag listener
    this.backgroundDragListener.press( event );
  }

  /**
   * For a CCKCChartNode that is not an icon, add a listener that
   * (1) drags the body
   * (2) constrains the drag to the screenView bounds
   * (3) drops back into the toolbox
   * @param {CCKCScreenView} screenView
   * @public
   */
  initializeBodyDragListener( screenView ) {

    // Since this will be shown from the toolbox, make the play area icon invisible and prepare to drag with probes
    this.meter.visibleProperty.value = false;
    this.meter.draggingProbesWithBodyProperty.value = true;

    const dragListener = new DragListener( {
      positionProperty: this.meter.bodyPositionProperty,
      useParentOffset: true,
      tandem: this.tandem.createTandem( 'dragHandler' ),
      start: () => {
        this.moveToFront();
        if ( this.meter.draggingProbesWithBodyProperty.value ) {

          // Align the probes each time the MeterBodyNode translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      drag: () => {
        if ( this.meter.draggingProbesWithBodyProperty.value ) {

          // Align the probes each time the MeterBodyNode translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      end: () => {

        // Drop in the toolbox if the center of the chart is within the sensor toolbox bounds
        if ( screenView.sensorToolbox.globalBounds.containsPoint( this.getBackgroundNodeGlobalBounds().center ) ) {
          this.alignProbesEmitter.emit();
          this.meter.visibleProperty.value = false;
        }

        // Move probes to center line (if water side view model)
        this.droppedEmitter.emit();
        this.meter.draggingProbesWithBodyProperty.value = false;
      }
    } );

    // Constrain the chart node to be within the visible bounds
    screenView.visibleBoundsProperty.link( visibleBounds => {
      const bounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      const b1 = screenView.localToGlobalBounds( bounds );
      dragListener.dragBounds = this.backgroundNode.globalToParentBounds( b1 );
    } );

    this.backgroundDragListener = dragListener;
    this.backgroundNode.addInputListener( dragListener );
  }
}

circuitConstructionKitCommon.register( 'CCKCChartNode', CCKCChartNode );
export default CCKCChartNode;
