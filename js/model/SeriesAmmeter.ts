// Copyright 2015-2025, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
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
import Multilink from '../../../axon/js/Multilink.js';
import dotRandom from '../../../dot/js/dotRandom.js';

type SelfOptions = EmptySelfOptions;
type SeriesAmmeterOptions = SelfOptions & FixedCircuitElementOptions;

const INSTRUMENT_UNCERTAINTY = 0.005; // Amperes
const NOISE_PERIOD = 0.2; // seconds

export default class SeriesAmmeter extends FixedCircuitElement {

  // the resistance in ohms.  A constant, but modeled as a property for uniformity with other resistive elements.
  public readonly resistanceProperty: NumberProperty;

  // the current the probe is displaying (in amperes) or null if unconnected
  public readonly currentReadoutProperty: Property<number | null>;

  private displayedValueUpdateTimer = 0;

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: SeriesAmmeterOptions ) {

    const options = optionize<SeriesAmmeterOptions, SelfOptions, FixedCircuitElementOptions>()( {

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

    this.currentReadoutProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'currentReadoutProperty' ),
      units: 'A',
      phetioValueType: NullableIO( NumberIO )
    } );

    // If there is no measurement noise or the current becomes null, update the current readout
    Multilink.multilink( [ this.currentProperty, this.currentReadoutProperty, measuringDeviceNoiseProperty ],
      ( current, currentReadout, measuringDeviceNoise ) => {
        if ( ( current === null ) !== ( currentReadout === null ) || !measuringDeviceNoise ) {
          if ( measuringDeviceNoise ) {
            this.displayedValueUpdateTimer = 0; // Reset the display update timer when the current is updated
            this.currentReadoutProperty.value = this.currentReadoutForCurrent( current );
          }
          else {
            this.currentReadoutProperty.value = current;
          }
        }
      } );
  }

  private currentReadoutForCurrent( current: number | null ): number | null {
    if ( current === null ) {
      return null;
    }

    return current + INSTRUMENT_UNCERTAINTY * dotRandom.nextGaussian();
  }

  public stepNoise( dt: number ): void {
    // Advance the noise timer, and if it is time to make noise, do so
    this.displayedValueUpdateTimer += dt;

    if ( this.displayedValueUpdateTimer > NOISE_PERIOD ) {
      this.displayedValueUpdateTimer = 0;

      if ( this.currentProperty.value !== null ) {

        // Use dotRandom.nextGaussian to add noise to the current reading
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