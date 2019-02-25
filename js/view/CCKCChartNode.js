// Copyright 2019, University of Colorado Boulder

/**
 * Provides simulation-specific values and customizations to display a ScrollingChartNode in a MeterBodyNode.
 * TODO: Copied from WaveMeterNode, can anything be factored out?
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCProbeNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCProbeNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const Emitter = require( 'AXON/Emitter' );
  const LabeledScrollingChartNode = require( 'GRIDDLE/LabeledScrollingChartNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NodeProperty = require( 'SCENERY/util/NodeProperty' );
  const Property = require( 'AXON/Property' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );
  const ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );
  const WireNode = require( 'SCENERY_PHET/WireNode' );

  // strings
  const timeString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/time' );

  // constants
  const SERIES_1_COLOR = '#5c5d5f'; // same as in Bending Light
  const SERIES_2_COLOR = '#ccced0'; // same as in Bending Light
  const WIRE_1_COLOR = SERIES_1_COLOR;
  const WIRE_2_COLOR = new Color( SERIES_2_COLOR ).darkerColor( 0.7 );
  const NUMBER_OF_TIME_DIVISIONS = 4;
  const AXIS_LABEL_FILL = 'white';
  const LABEL_FONT_SIZE = 14;

  // For the wires
  const NORMAL_DISTANCE = 25;
  const WIRE_LINE_WIDTH = 3;

  class CCKCChartNode extends Node {

    /**
     * @param {Object} [options]
     */
    constructor( timeProperty, isInPlayAreaProperty, visibleBoundsProperty, options ) {
      options = _.extend( {
        timeDivisions: NUMBER_OF_TIME_DIVISIONS,

        // Prevent adjustment of the control panel rendering while dragging,
        // see https://github.com/phetsims/wave-interference/issues/212
        preventFit: true
      }, options );
      const backgroundNode = new Node( { cursor: 'pointer' } );

      super();

      // @private
      this.timeProperty = timeProperty;

      // @private
      this.isInPlayAreaProperty = isInPlayAreaProperty;

      // @private
      this.visibleBoundsProperty = visibleBoundsProperty;

      // @public (read-only) {Node} - shows the background for the MeterBodyNode.  Any attached probes or other
      // supplemental nodes should not be children if the backgroundNode if they need to translate independently.
      this.backgroundNode = backgroundNode;

      // @private {DragListener} - set by setDragListener
      this.backgroundDragListener = null;

      this.addChild( this.backgroundNode );

      // Mutate after backgroundNode is added as a child
      this.mutate( options );

      // @public {boolean} - true if dragging the MeterBodyNode also causes attached probes to translate.
      // This is accomplished by calling alignProbes() on drag start and each drag event.
      this.synchronizeProbeLocations = false;

      // @public - emits when the probes should be put in standard relative location to the body
      this.alignProbesEmitter = new Emitter();

      // These do not need to be disposed because there is no connection to the "outside world"
      const leftBottomProperty = new NodeProperty( backgroundNode, 'bounds', 'leftBottom' );

      // @public - emits when the CCKCChartNode has been dropped
      this.droppedEmitter = new Emitter();

      const aboveBottomLeft1 = new DerivedProperty(
        [ leftBottomProperty ],
        position => position.isFinite() ? position.plusXY( 0, -20 ) : Vector2.ZERO
      );
      const aboveBottomLeft2 = new DerivedProperty(
        [ leftBottomProperty ],
        position => position.isFinite() ? position.plusXY( 0, -10 ) : Vector2.ZERO
      );
      this.series1 = this.initializeSeries( SERIES_1_COLOR, WIRE_1_COLOR, 5, 10, aboveBottomLeft1 );
      this.series2 = this.initializeSeries( SERIES_2_COLOR, WIRE_2_COLOR, 36, 54, aboveBottomLeft2 );

      const verticalAxisTitleNode = new Text( 'verticalAxisLabel', {
        fontSize: LABEL_FONT_SIZE,
        rotation: -Math.PI / 2,
        fill: AXIS_LABEL_FILL
      } );
      const scaleIndicatorText = new Text( 'scaleIndicatorText', {
        fontSize: 11,
        fill: 'white'
      } );

      // Create the scrolling chart content and add it to the background.  There is an order-of-creation cycle which
      // prevents the scrolling node from being added to the background before the super() call, so this will have to
      // suffice.
      //

      const scrollingChartNode = new LabeledScrollingChartNode(
        new ScrollingChartNode( timeProperty, [ this.series1, this.series2 ], {
          width: 150,
          height: 110
        } ),
        verticalAxisTitleNode,
        scaleIndicatorText,
        timeString,
        _.omit( options, 'scale' ) // Don't apply the scale to both parent and children
      );
      const shadedRectangle = new ShadedRectangle( scrollingChartNode.bounds.dilated( 7 ) );
      shadedRectangle.addChild( scrollingChartNode );
      backgroundNode.addChild( shadedRectangle );

      this.alignProbesEmitter.emit();
    }

    /**
     * @param {Color|string} color
     * @param {Color|string} wireColor
     * @param {number} dx - initial relative x coordinate for the probe
     * @param {number} dy - initial relative y coordinate for the probe
     * @param {Property.<Vector2>} connectionProperty
     * @returns {DynamicSeries}
     * @protected
     */
    initializeSeries( color, wireColor, dx, dy, connectionProperty ) {

      const probeNode = new CCKCProbeNode( this.visibleBoundsProperty, { color: color } );

      // Add the wire behind the probe.
      this.addChild( new WireNode( connectionProperty, new Property( new Vector2( -NORMAL_DISTANCE, 0 ) ),
        new NodeProperty( probeNode, 'bounds', 'centerBottom' ), new Property( new Vector2( 0, NORMAL_DISTANCE ) ), {
          lineWidth: WIRE_LINE_WIDTH,
          stroke: wireColor
        }
      ) );
      this.addChild( probeNode );

      // Standard location in toolbox and when dragging out of toolbox.
      const alignProbes = () => {
        probeNode.mutate( {
          right: this.backgroundNode.left - dx,
          top: this.backgroundNode.top + dy
        } );

        // Prevent the probes from going out of the visible bounds when tagging along with the dragged CCKCChartNode
        probeNode.translation = this.visibleBoundsProperty.value.closestPointTo( probeNode.translation );
      };
      this.on( 'visibility', alignProbes );
      this.alignProbesEmitter.addListener( alignProbes );

      const dynamicSeries = new DynamicSeries( { color: color } );
      dynamicSeries.probeNode = probeNode;

      const updateSamples = () => {

        // Set the range by incorporating the model's time units, so it will match with the timer.
        const maxSeconds = NUMBER_OF_TIME_DIVISIONS;

        if ( this.isInPlayAreaProperty.get() ) {
          dynamicSeries.data.push( new Vector2( this.timeProperty.value, 0 ) );
        }
        while ( dynamicSeries.data.length > 0 && dynamicSeries.data[ 0 ].x < this.timeProperty.value - maxSeconds ) {
          dynamicSeries.data.shift();
        }
        dynamicSeries.emitter.emit();
      };

      // When the wave is paused and the user is dragging the entire MeterBodyNode with the probes aligned, they
      // need to sample their new locations.
      probeNode.on( 'transform', updateSamples );

      return dynamicSeries;
    }

    /**
     * Steps in time
     * @param {number} time - total elapsed time in seconds
     * @param {number} dt - delta time since last update
     */
    step( time, dt ) {
      this.series1.data.push( new Vector2( time, Math.sin( time ) ) );
      this.series1.emitter.emit();

      this.series2.data.push( new Vector2( time, Math.cos( time ) ) );
      this.series2.emitter.emit();

      // TODO: series data must be pruned
    }

    /**
     * Clear the data from the chart.
     * @public
     */
    reset() {
      this.series1.clear();
      this.series2.clear();
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
      this.backgroundDragListener.press( event, this.backgroundNode );
    }

    /**
     * Set the drag listener, wires it up and uses it for forwarding events from the toolbox icon.
     * @param {DragListener} dragListener
     * @public
     */
    setDragListener( dragListener ) {
      assert && assert( this.backgroundDragListener === null, 'setDragListener must be called no more than once' );
      this.backgroundDragListener = dragListener;
      this.backgroundNode.addInputListener( dragListener );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCChartNode', CCKCChartNode );
} );