// Copyright 2015-2020, University of Colorado Boulder

/**
 * The ACVoltage is a circuit element that provides an oscillating voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import VoltageSource from './VoltageSource.js';

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
const MAX_VOLTAGE = 120;

class ACVoltage extends VoltageSource {

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, internalResistanceProperty, tandem, options ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    options = merge( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: 1,
      voltagePropertyOptions: {
        range: new Range( -MAX_VOLTAGE, MAX_VOLTAGE )
      }
    }, options );
    super( startVertex, endVertex, internalResistanceProperty, BATTERY_LENGTH, tandem, options );

    // @public {NumberProperty} - the maximum voltage, which can be controlled by the CircuitElementNumberControl
    this.maximumVoltageProperty = new NumberProperty( options.voltage, {
      tandem: tandem.createTandem( 'maximumVoltageProperty' ),
      range: new Range( 0, MAX_VOLTAGE )
    } );

    this.frequencyProperty = new NumberProperty( 0.5, {
      tandem: tandem.createTandem( 'frequencyProperty' ),
      range: new Range( 0.1, 2.0 )
    } );

    // @public (read-only)
    this.phaseProperty = new NumberProperty( 0, {
      range: new Range( -180, 180 ),
      tandem: tandem.createTandem( 'phaseProperty' ),
      units: '\u00B0' // degrees
    } );

    // @private
    this.time = 0;
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.maximumVoltageProperty.dispose();
    this.frequencyProperty.dispose();
    this.phaseProperty.dispose();
    super.dispose();
  }

  /**
   * @param {number} time - total elapsed time
   * @param {number} dt - delta between last frame and current frame
   * @public
   */
  step( time, dt, circuit ) {
    super.step( time, dt, circuit );
    this.time = time;
    this.voltageProperty.set(
      this.maximumVoltageProperty.value * Math.sin( 2 * Math.PI * this.frequencyProperty.value * time + this.phaseProperty.value * Math.PI / 180 )
    );
  }
}

circuitConstructionKitCommon.register( 'ACVoltage', ACVoltage );
export default ACVoltage;