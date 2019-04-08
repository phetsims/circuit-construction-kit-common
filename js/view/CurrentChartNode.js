// Copyright 2019, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCChartNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const currentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/current' );

  // constants
  const NUMBER_OF_TIME_DIVISIONS = 4; // TODO: same in VoltageChartNode
  const SERIES_1_COLOR = '#404041'; // TODO: duplicated in VoltageChartNode
  const WIRE_1_COLOR = SERIES_1_COLOR;

  class CurrentChartNode extends CCKCChartNode {

    /**
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {NumberProperty} timeProperty
     * @param {Property.<Bounds2>} visibleBoundsProperty
     * @param {Object} [options]
     */
    constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, options ) {

      options = _.extend( {
        timeDivisions: NUMBER_OF_TIME_DIVISIONS,
        tandem: Tandem.optional
      }, options );

      // TODO: same color as dark color in voltage chart node
      const series = new DynamicSeries( { color: '#717274' } ); // dark gray sampled from the design doc
      super( circuitLayerNode, timeProperty, visibleBoundsProperty, [ series ], currentString, options );

      // @private
      this.series = series;
      this.probeNode1 = this.addProbeNode( SERIES_1_COLOR, WIRE_1_COLOR, 5, 10, this.aboveBottomLeft1 );

      // Align probes after positioning the body so icons will have the correct bounds
      this.alignProbesEmitter.emit();
    }

    /**
     * Steps in time
     * @param {number} time - total elapsed time in seconds
     * @param {number} dt - delta time since last update
     */
    step( time, dt ) {
      const current = this.circuitLayerNode.getCurrent( this.probeNode1 );

      // TODO: add scaling to ScrollingChartNode
      this.series.data.push( new Vector2( time, current === null ? NaN : current / 10 || 0 ) );
      this.series.emitter.emit();

      while ( this.series.data.length > 0 && this.series.data[ 0 ].x < this.timeProperty.value - NUMBER_OF_TIME_DIVISIONS ) {
        this.series.data.shift();
      }
    }
  }

  return circuitConstructionKitCommon.register( 'CurrentChartNode', CurrentChartNode );
} );