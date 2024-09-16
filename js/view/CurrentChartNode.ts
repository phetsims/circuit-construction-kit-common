// Copyright 2019-2025, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import type Property from '../../../axon/js/Property.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCChartNode, { CCKCChartNodeOptions } from './CCKCChartNode.js';
import CircuitNode from './CircuitNode.js';
import CCKCProbeNode from './CCKCProbeNode.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import measuringDeviceNoiseProperty from '../model/measuringDeviceNoiseProperty.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';

const currentWithUnitsStringProperty = CircuitConstructionKitCommonStrings.currentWithUnitsStringProperty;

const MEASUREMENT_NOISE = 0.02;

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
      const current = ammeterConnection === null ? null : this.currentReadoutForCurrent( ammeterConnection.current );
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
    const current = ammeterConnection === null ? null : this.currentReadoutForCurrent( ammeterConnection.current );
    assert && assert( typeof this.lastStepTime === 'number' );
    if ( typeof this.lastStepTime === 'number' ) {
      this.series.push( current === null ? null : new Vector2( this.lastStepTime, current || 0 ) );
    }

    this.updatePen();
  }

  private currentReadoutForCurrent( current: number ): number {
    return measuringDeviceNoiseProperty.value ? current + MEASUREMENT_NOISE * dotRandom.nextGaussian() : current;
  }
}

circuitConstructionKitCommon.register( 'CurrentChartNode', CurrentChartNode );