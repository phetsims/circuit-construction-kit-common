// Copyright 2019-2020, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCChartNode from './CCKCChartNode.js';

const voltageWithUnitsString = circuitConstructionKitCommonStrings.voltageWithUnits;

// constants
const SERIES_1_COLOR = '#ec3223';
const SERIES_2_COLOR = CCKCConstants.CHART_SERIES_COLOR;

class VoltageChartNode extends CCKCChartNode {

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {NumberProperty} timeProperty
   * @param {Property.<Bounds2>} visibleBoundsProperty
   * @param {Object} [options]
   */
  constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, options ) {

    options = merge( {
      defaultZoomLevel: new Range(-10,10),
      timeDivisions: CCKCConstants.NUMBER_OF_TIME_DIVISIONS,
      tandem: Tandem.OPTIONAL
    }, options );

    super( circuitLayerNode, timeProperty, visibleBoundsProperty, createObservableArray(), voltageWithUnitsString, options );

    // @private
    this.probeNode1 = this.addProbeNode( SERIES_1_COLOR, SERIES_1_COLOR, 5, 10, this.aboveBottomLeft1, options.tandem.createTandem( 'probeNode1' ) );
    this.probeNode2 = this.addProbeNode( SERIES_2_COLOR, SERIES_2_COLOR, 36, 54, this.aboveBottomLeft2, options.tandem.createTandem( 'probeNode2' ) );

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
      const redPoint = this.circuitLayerNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode1.translation ) );
      const blackPoint = this.circuitLayerNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode2.translation ) );

      const redConnection = this.circuitLayerNode.getVoltageConnection( redPoint );
      const blackConnection = this.circuitLayerNode.getVoltageConnection( blackPoint );
      const voltage = this.circuitLayerNode.circuit.getVoltageBetweenConnections( redConnection, blackConnection );

      this.series.push( voltage === null ? null : new Vector2( time, voltage || 0 ) );

      // For debugging, depict the points where the sampling happens
      if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

        // These get erased when changing between lifelike/schematic
        this.circuitLayerNode.addChild( new Rectangle( -1, -1, 2, 2, {
          fill: Color.BLACK,
          translation: redPoint
        } ) );
      }

      while ( ( this.series[ 0 ] === null ) ||
              ( this.series.length > 0 && this.series[ 0 ].x < this.timeProperty.value - CCKCConstants.NUMBER_OF_TIME_DIVISIONS ) ) {
        this.series.shift();
      }
    }
  }
}

circuitConstructionKitCommon.register( 'VoltageChartNode', VoltageChartNode );
export default VoltageChartNode;