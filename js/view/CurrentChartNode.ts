// Copyright 2019-2023, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import Vector2 from '../../../dot/js/Vector2.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCChartNode, { CCKCChartNodeOptions } from './CCKCChartNode.js';
import CircuitNode from './CircuitNode.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import CCKCProbeNode from './CCKCProbeNode.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

const currentWithUnitsStringProperty = CircuitConstructionKitCommonStrings.currentWithUnitsStringProperty;

export default class CurrentChartNode extends CCKCChartNode {
  private readonly probeNode1: CCKCProbeNode;
  private lastStepTime: number | null;

  /**
   * @param circuitNode
   * @param timeProperty
   * @param visibleBoundsProperty
   * @param [providedOptions]
   */
  public constructor( circuitNode: CircuitNode, timeProperty: Property<number>, visibleBoundsProperty: Property<Bounds2>,
                      providedOptions?: CCKCChartNodeOptions ) {

    const options = optionize<CCKCChartNodeOptions, EmptySelfOptions, CCKCChartNodeOptions>()( {}, providedOptions );

    super( circuitNode, timeProperty, visibleBoundsProperty, createObservableArray(), currentWithUnitsStringProperty, providedOptions );

    this.probeNode1 = this.addProbeNode(
      CCKCConstants.CHART_SERIES_COLOR,
      CCKCConstants.CHART_SERIES_COLOR,
      5,
      10,
      this.aboveBottomLeft1Property,
      options.tandem.createTandem( 'probeNode' )
    );
    this.lastStepTime = null;
  }

  /**
   * Records data and displays it on the chart
   * @param time - total elapsed time in seconds
   * @param dt - delta time since last update
   */
  public step( time: number, dt: number ): void {
    if ( this.meter.isActiveProperty.value ) {
      const ammeterConnection = this.circuitNode.getCurrent( this.probeNode1 );
      const current = ammeterConnection === null ? null : ammeterConnection.current;
      this.series.push( current === null ? null : new Vector2( time, current || 0 ) );
      while ( ( this.series[ 0 ] === null ) ||
              ( this.series.length > 0 && this.series[ 0 ].x < this.timeProperty.value - CCKCConstants.NUMBER_OF_TIME_DIVISIONS ) ) {
        this.series.shift();
      }
    }
    this.updatePen();
    this.lastStepTime = time;
  }

  public sampleLatestValue(): void {

    // Avoid trouble during fuzzboard startup
    if ( this.lastStepTime === null ) {
      return;
    }

    this.series.pop();

    const ammeterConnection = this.circuitNode.getCurrent( this.probeNode1 );
    const current = ammeterConnection === null ? null : ammeterConnection.current;
    assert && assert( typeof this.lastStepTime === 'number' );
    if ( typeof this.lastStepTime === 'number' ) {
      this.series.push( current === null ? null : new Vector2( this.lastStepTime, current || 0 ) );
    }

    this.updatePen();
  }
}

circuitConstructionKitCommon.register( 'CurrentChartNode', CurrentChartNode );