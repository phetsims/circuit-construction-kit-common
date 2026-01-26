// Copyright 2019-2025, University of Colorado Boulder

/**
 * Shows the voltage as a function of time on a scrolling chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import type Property from '../../../axon/js/Property.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CCKCChartNode, { type CCKCChartNodeOptions } from './CCKCChartNode.js';
import type CCKCProbeNode from './CCKCProbeNode.js';
import type CircuitNode from './CircuitNode.js';

const voltageWithUnitsStringProperty = CircuitConstructionKitCommonFluent.voltageWithUnitsStringProperty;

// constants
const SERIES_1_COLOR = '#ec3223';
const SERIES_2_COLOR = CCKCConstants.CHART_SERIES_COLOR;

export default class VoltageChartNode extends CCKCChartNode {
  private readonly probeNode1: CCKCProbeNode;
  private readonly probeNode2: CCKCProbeNode;
  private lastStepTime: number | null;

  public constructor( circuitNode: CircuitNode, timeProperty: Property<number>, visibleBoundsProperty: Property<Bounds2>, providedOptions?: CCKCChartNodeOptions ) {

    providedOptions = combineOptions<CCKCChartNodeOptions>( {
      defaultZoomLevel: new Range( -10, 10 ),
      tandem: Tandem.OPTIONAL
    }, providedOptions );

    super( circuitNode, timeProperty, visibleBoundsProperty, createObservableArray(), voltageWithUnitsStringProperty, providedOptions );

    this.probeNode1 = this.addProbeNode( SERIES_1_COLOR, SERIES_1_COLOR, 5, 10, this.aboveBottomLeft1Property, providedOptions.tandem.createTandem( 'probeNode1' ) );
    this.probeNode2 = this.addProbeNode( SERIES_2_COLOR, SERIES_2_COLOR, 36, 54, this.aboveBottomLeft2Property, providedOptions.tandem.createTandem( 'probeNode2' ) );

    this.lastStepTime = null;
  }

  public sampleValue( time: number ): Vector2 | null {
    const redPoint = this.circuitNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode1.translation ) );
    const blackPoint = this.circuitNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode2.translation ) );

    const redConnection = this.circuitNode.getVoltageConnection( redPoint );
    const blackConnection = this.circuitNode.getVoltageConnection( blackPoint );
    const voltage = this.circuitNode.circuit.getVoltageBetweenConnections( redConnection, blackConnection, false );

    return voltage === null ? null : new Vector2( time, voltage );
  }

  /**
   * Records data and displays it on the chart
   * @param time - total elapsed time in seconds
   * @param dt - delta time since last update
   */
  public step( time: number, dt: number ): void {
    if ( this.meter.isActiveProperty.value ) {

      this.series.push( this.sampleValue( time ) );

      // For debugging, depict the points where the sampling happens
      if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

        // These get erased when changing between lifelike/schematic
        this.circuitNode.addChild( new Rectangle( -1, -1, 2, 2, {
          fill: Color.BLACK,
          translation: this.circuitNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode1.translation ) )
        } ) );
      }

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
    affirm( typeof this.lastStepTime === 'number' );
    if ( typeof this.lastStepTime === 'number' ) {
      this.series.push( this.sampleValue( this.lastStepTime ) );
    }

    this.updatePen();
  }
}

circuitConstructionKitCommon.register( 'VoltageChartNode', VoltageChartNode );