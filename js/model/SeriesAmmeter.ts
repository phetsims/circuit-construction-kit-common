// Copyright 2015-2025, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import type Property from '../../../axon/js/Property.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import measuringDeviceNoiseProperty from './measuringDeviceNoiseProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import { sensorDisplayUpdatePeriodProperty } from './Meter.js';

type SelfOptions = {
  alternate?: boolean;
  ammeterNumber?: number | null; // Which number is used for labeling the ammeter (e.g. 'Ammeter 1') - Null means no number is used
};
type SeriesAmmeterOptions = SelfOptions & FixedCircuitElementOptions;

const MEASURING_DEVICE_NOISE = 0.005; // Amperes

export default class SeriesAmmeter extends FixedCircuitElement {

  // the resistance in ohms.  A constant, but modeled as a property for uniformity with other resistive elements.
  public readonly resistanceProperty: NumberProperty;

  // the resistance including any noise from circuitElementNoiseProperty
  public readonly resistanceWithNoiseProperty: NumberProperty;

  // the current the probe is displaying (in amperes) or null if unconnected
  public readonly currentReadoutProperty: Property<number | null>;

  public readonly isAlternate;

  public readonly ammeterNumberProperty: Property<number | null>;

  private displayedValueUpdateTimer = 0;

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: SeriesAmmeterOptions ) {

    const options = optionize<SeriesAmmeterOptions, SelfOptions, FixedCircuitElementOptions>()( {

      // By default, series ammeters are not high-precision
      alternate: false,

      // By default, series ammeters do not include the numerical label in the title
      ammeterNumber: null,

      // SeriesAmmeters do not have these features, so opt out of PhET-iO instrumentation here
      isEditablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      isValueDisplayablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      labelStringPropertyOptions: {
        tandem: Tandem.OPT_OUT
      }
    }, providedOptions );
    super( startVertex, endVertex, CCKCConstants.SERIES_AMMETER_LENGTH, tandem, options );

    this.resistanceProperty = new NumberProperty( 0 );
    this.resistanceWithNoiseProperty = new NumberProperty( 0 );

    this.isAlternate = options.alternate;

    this.ammeterNumberProperty = new Property<number | null>( options.ammeterNumber, {
      tandem: tandem.createTandem( 'ammeterNumberProperty' ),
      units: 'A',
      phetioValueType: NullableIO( NumberIO )
    } );

    this.currentReadoutProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'currentReadoutProperty' ),
      units: 'A',
      phetioValueType: NullableIO( NumberIO )
    } );

    // If the measured current goes from null to non-null or vice versa, eagerly update the displayed value
    // and restart the display update timer
    this.currentProperty.link( ( current, previousCurrent ) => {
      if ( ( current === null ) !== ( previousCurrent === null ) ) {
        this.displayedValueUpdateTimer = 0; // Reset the display update timer when the current is updated
        this.currentReadoutProperty.value = this.currentReadoutForCurrent( current );
      }
    } );

    // If measuringDeviceNoise is turned on or off, eagerly update the displayed value
    measuringDeviceNoiseProperty.link( () => {
      this.currentReadoutProperty.value = this.currentReadoutForCurrent( this.currentProperty.value );
    } );
  }

  private currentReadoutForCurrent( current: number | null ): number | null {
    if ( current === null ) {
      return null;
    }
    else if ( measuringDeviceNoiseProperty.value ) {

      // Add the measurement noise to the instrument reading
      return current + MEASURING_DEVICE_NOISE * dotRandom.nextGaussian();
    }
    else {
      return current;
    }
  }

  public stepDisplayUpdateTimer( dt: number ): void {

    // Advance the noise timer, and if it is time to make noise, do so
    this.displayedValueUpdateTimer += dt;

    if ( this.displayedValueUpdateTimer > sensorDisplayUpdatePeriodProperty.value ) {
      this.displayedValueUpdateTimer = 0;

      if ( this.currentProperty.value !== null ) {

        // Incorporate any measurement noise in the voltmeter readout
        this.currentReadoutProperty.value = this.currentReadoutForCurrent( this.currentProperty.value );
      }
    }
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {

    // No internal parameters that can change the circuit
    return [];
  }
}

circuitConstructionKitCommon.register( 'SeriesAmmeter', SeriesAmmeter );