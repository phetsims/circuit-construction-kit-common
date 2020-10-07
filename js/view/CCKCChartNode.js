// Copyright 2019-2020, University of Colorado Boulder

/**
 * Provides simulation-specific values and customizations to display a SeismographNode in a MeterBodyNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import SeismographNode from '../../../griddle/js/SeismographNode.js';
import merge from '../../../phet-core/js/merge.js';
import MovableDragHandler from '../../../scenery-phet/js/input/MovableDragHandler.js';
import ShadedRectangle from '../../../scenery-phet/js/ShadedRectangle.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
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
   * @param {DynamicSeries[]} seriesArray
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

    const verticalAxisTitleNode = new Text( verticalAxisLabel, {
      rotation: -Math.PI / 2,
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL
    } );
    const horizontalAxisTitleNode = new Text( timeString, {
      fontSize: LABEL_FONT_SIZE,
      fill: AXIS_LABEL_FILL
    } );
    const scaleIndicatorText = new Text( oneSecondString, {
      fontSize: 11,
      fill: 'white'
    } );

    // Create the scrolling chart content and add it to the background.  There is an order-of-creation cycle which
    // prevents the scrolling node from being added to the background before the super() call, so this will have to
    // suffice.
    this.seismographNode = new SeismographNode( timeProperty, seriesArray, scaleIndicatorText, {
      width: 150, height: 110,
      horizontalAxisLabelNode: horizontalAxisTitleNode,
      verticalAxisLabelNode: verticalAxisTitleNode,
      verticalRanges: [
        new Range( -0.4, 0.4 ),
        new Range( -2, 2 ),
        new Range( -10, 10 ),
        new Range( -20, 20 ),
        new Range( -50, 50 ),
        new Range( -100, 100 ),
        new Range( -150, 150 ),
        new Range( -200, 200 ),
        new Range( -400, 400 ),
        new Range( -600, 600 ),
        new Range( -800, 800 ),
        new Range( -1000, 1000 ),
        new Range( -1200, 1200 )
      ],
      initialVerticalRangeIndex: 1,
      verticalGridLabelNumberOfDecimalPlaces: 0,
      tandem: options.tandem.createTandem( 'seismographNode' )
    } );

    this.seismographNode.verticalRangeProperty.link( verticalRange => {
      const decimalPlaces = verticalRange.max <= 1 ? 1 : 0;
      this.seismographNode.setGridLinePrecision( decimalPlaces );
      this.seismographNode.setVerticalGridLabelNumberOfDecimalPlaces( decimalPlaces );
    } );

    const shadedRectangle = new ShadedRectangle( this.seismographNode.bounds.dilated( 7 ), {
      baseColor: '#327198'
    } );
    shadedRectangle.addChild( this.seismographNode );
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
    this.seismographNode.reset();
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
    this.backgroundDragListener.startDrag( event );
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

    // I tried using DragListener, but AmmeterNode and VoltmeterNode are using MovableDragHandler, so to reuse
    // the same strategy in SensorToolNode (regarding Meter) we need to use MovableDragHandler.  DragListener
    // led to incorrect and unresolved offsets and behavior.
    const movableDragHandler = new MovableDragHandler( this.meter.bodyPositionProperty, {
      tandem: this.tandem.createTandem( 'dragHandler' ),
      targetNode: this.backgroundNode,
      startDrag: () => {
        this.moveToFront();
        if ( this.meter.draggingProbesWithBodyProperty.value ) {

          // Align the probes each time the MeterBodyNode translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      onDrag: () => {
        if ( this.meter.draggingProbesWithBodyProperty.value ) {

          // Align the probes each time the MeterBodyNode translates, so they will stay in sync
          this.alignProbesEmitter.emit();
        }
      },
      endDrag: () => {

        // Drop in toolbox, using the bounds of the entire this since it cannot be centered over the toolbox
        // (too close to the edge of the screen)
        if ( screenView.sensorToolbox.globalBounds.intersectsBounds( this.getBackgroundNodeGlobalBounds() ) ) {
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
      movableDragHandler.dragBounds = this.backgroundNode.globalToParentBounds( b1 );
    } );

    this.backgroundDragListener = movableDragHandler;
    this.backgroundNode.addInputListener( movableDragHandler );
  }
}

circuitConstructionKitCommon.register( 'CCKCChartNode', CCKCChartNode );
export default CCKCChartNode;
