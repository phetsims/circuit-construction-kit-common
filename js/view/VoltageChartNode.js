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
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );

  // constants
  const NUMBER_OF_TIME_DIVISIONS = 4;

  class VoltageChartNode extends CCKCChartNode {

    /**
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {NumberProperty} timeProperty
     * @param {BooleanProperty} isInPlayAreaProperty
     * @param {Property.<Bounds2>} visibleBoundsProperty
     * @param {Object} [options]
     */
    constructor( circuitLayerNode, timeProperty, visibleBoundsProperty, options ) {

      options = _.extend( {
        timeDivisions: NUMBER_OF_TIME_DIVISIONS,
        tandem: Tandem.optional
      }, options );

      const series = new DynamicSeries( { color: '#717274' } ); // dark gray sampled from the design doc
      super( circuitLayerNode, timeProperty, visibleBoundsProperty, [ series ], voltageString, options );

      // @private
      this.series = series;
    }

    /**
     * Steps in time
     * @param {number} time - total elapsed time in seconds
     * @param {number} dt - delta time since last update
     */
    step( time, dt ) {

      const redPoint = this.circuitLayerNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode1.translation ) );
      const blackPoint = this.circuitLayerNode.globalToLocalPoint( this.localToGlobalPoint( this.probeNode2.translation ) );

      const red = this.circuitLayerNode.getVoltageConnection( redPoint );
      const black = this.circuitLayerNode.getVoltageConnection( blackPoint );
      const voltage = this.circuitLayerNode.getVoltage( red, black );

      // TODO: add scaling to ScrollingChartNode
      this.series.data.push( new Vector2( time, voltage === null ? NaN : voltage / 10 || 0 ) );
      this.series.emitter.emit();

      // For debugging, depict the points where the sampling happens
      if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

        // These get erased when changing between lifelike/schematic
        this.circuitLayerNode.addChild( new Rectangle( -1, -1, 2, 2, {
          fill: Color.BLACK,
          translation: redPoint
        } ) );
      }

      while ( this.series.data.length > 0 && this.series.data[ 0 ].x < this.timeProperty.value - NUMBER_OF_TIME_DIVISIONS ) {
        this.series.data.shift();
      }
    }
  }

  return circuitConstructionKitCommon.register( 'VoltageChartNode', VoltageChartNode );
} );