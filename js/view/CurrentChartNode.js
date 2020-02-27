// Copyright 2019, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicSeries from '../../../griddle/js/DynamicSeries.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuit-construction-kit-common-strings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCChartNode from './CCKCChartNode.js';

const currentWithUnitsString = circuitConstructionKitCommonStrings.currentWithUnits;

class CurrentChartNode extends CCKCChartNode {

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {NumberProperty} timeProperty
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Object} [options]
   */
  constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, options ) {

    options = merge( {
      timeDivisions: CCKCConstants.NUMBER_OF_TIME_DIVISIONS,
      tandem: Tandem.OPTIONAL
    }, options );

    const series = new DynamicSeries( CCKCConstants.DYNAMIC_SERIES_OPTIONS );
    super( circuitLayerNode, timeProperty, visibleBoundsProperty, [ series ], currentWithUnitsString, options );

    // @private
    this.series = series;
    this.probeNode1 = this.addProbeNode(
      CCKCConstants.CHART_SERIES_COLOR,
      CCKCConstants.CHART_SERIES_COLOR,
      5,
      10,
      this.aboveBottomLeft1,
      options.tandem.createTandem( 'probeNode' )
    );

    // Align probes after positioning the body so icons will have the correct bounds
    this.alignProbesEmitter.emit();
  }

  /**
   * Records data and displays it on the chart
   * @param {number} time - total elapsed time in seconds
   * @param {number} dt - delta time since last update
   * @public
   */
  step( time, dt ) {
    if ( this.meter.visibleProperty.value ) {
      const current = this.circuitLayerNode.getCurrent( this.probeNode1 );
      this.series.addXYDataPoint( time, current === null ? NaN : current || 0 );
      while ( this.series.hasData() && this.series.getDataPoint( 0 ).x < this.timeProperty.value - CCKCConstants.NUMBER_OF_TIME_DIVISIONS ) {
        this.series.shiftData();
      }
    }
  }
}

circuitConstructionKitCommon.register( 'CurrentChartNode', CurrentChartNode );
export default CurrentChartNode;