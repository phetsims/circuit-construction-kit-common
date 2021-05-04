// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCChartNode from './CCKCChartNode.js';

const currentWithUnitsString = circuitConstructionKitCommonStrings.currentWithUnits;

class CurrentChartNode extends CCKCChartNode {

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {NumberProperty} timeProperty REVIEW: code review doc recommends Property.<number> for Derived/Dynamic/Tiny compatibility
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Object} [options]
   */
  constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, options ) {

    options = merge( {
      timeDivisions: CCKCConstants.NUMBER_OF_TIME_DIVISIONS,
      tandem: Tandem.OPTIONAL
    }, options );

    super( circuitLayerNode, timeProperty, visibleBoundsProperty, createObservableArray(), currentWithUnitsString, options );

    // @private {CCKCProbeNode}
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
      this.series.push( current === null ? null : new Vector2( time, current || 0 ) );
      while ( ( this.series[ 0 ] === null ) ||
              ( this.series.length > 0 && this.series[ 0 ].x < this.timeProperty.value - CCKCConstants.NUMBER_OF_TIME_DIVISIONS ) ) {
        this.series.shift();
      }
    }
  }
}

circuitConstructionKitCommon.register( 'CurrentChartNode', CurrentChartNode );
export default CurrentChartNode;