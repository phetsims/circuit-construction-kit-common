// Copyright 2016-2025, University of Colorado Boulder

/**
 * Model for the Ammeter, which adds the probe position and current readout.  There is only one ammeter per screen and
 * it is shown/hidden.  Hence it does not need a dispose() implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type AmmeterConnection from './AmmeterConnection.js';
import CircuitElement from './CircuitElement.js';
import Meter from './Meter.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Multilink from '../../../axon/js/Multilink.js';
import measurementNoiseProperty from './measurementNoiseProperty.js';

const INSTRUMENT_UNCERTAINTY = 0.02; // Amperes
const NOISE_PERIOD = 0.5; // seconds

export default class Ammeter extends Meter {

  // the full-precision reading on the ammeter. It will be formatted for display in the view.  Null means the ammeter is not on a wire.
  public readonly currentProperty: Property<number | null>;

  // the current the probe is displaying (in amperes) or null if unconnected
  public readonly currentReadoutProperty: Property<number | null>;

  // the position of the tip of the probe
  public readonly probePositionProperty: Property<Vector2>;
  private readonly probeConnectionProperty: Property<CircuitElement | null>;

  private noiseTimer = 0;

  public constructor( tandem: Tandem, phetioIndex: number ) {
    super( tandem, phetioIndex );

    this.currentProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'currentProperty' ),
      units: 'A',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.currentReadoutProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'currentReadoutProperty' ),
      units: 'A',
      phetioValueType: NullableIO( NumberIO )
    } );

    this.probePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'probePositionProperty' ),
      phetioFeatured: true
    } );

    this.probeConnectionProperty = new Property<CircuitElement | null>( null, {
      tandem: tandem.createTandem( 'probeConnectionProperty' ),
      phetioFeatured: true,
      phetioValueType: NullableIO( ReferenceIO( CircuitElement.CircuitElementIO ) ),
      phetioReadOnly: true,
      phetioDocumentation: 'The circuit element that the ammeter is connected to, or null if not connected to a circuit element'
    } );

    this.isActiveProperty.link( isActive => {
      if ( !isActive ) {
        this.probeConnectionProperty.value = null;
      }
    } );

    // If there is no measurement noise or the current becomes null, update the current readout
    Multilink.multilink( [ this.currentProperty, this.currentReadoutProperty, measurementNoiseProperty ],
      ( current, currentReadout, measurementNoise ) => {
        if ( ( current === null ) !== ( currentReadout === null ) || !measurementNoise ) {
          if ( measurementNoise ) {
            this.noiseTimer = 0; // Reset the noise timer when the current is updated
            this.currentReadoutProperty.value = this.currentReadoutForCurrent( current );
          }
          else {
            this.currentReadoutProperty.value = current;
          }
        }
      } );
  }

  public setConnectionAndCurrent( ammeterConnection: AmmeterConnection | null ): void {
    this.currentProperty.value = ammeterConnection === null ? null : ammeterConnection.current;
    this.probeConnectionProperty.value = ammeterConnection === null ? null : ammeterConnection.circuitElement;
  }

  private currentReadoutForCurrent( current: number | null ): number | null {
    if ( current === null ) {
      return null;
    }

    return current + INSTRUMENT_UNCERTAINTY * dotRandom.nextGaussian();
  }

  public stepNoise( dt: number ): void {
    if ( this.isActiveProperty.value ) {

      // Advance the noise timer, and if it is time to make noise, do so
      this.noiseTimer += dt;

      if ( this.noiseTimer > NOISE_PERIOD ) {
        this.noiseTimer = 0;

        if ( this.currentProperty.value !== null ) {

          // Use dotRandom.nextGaussian to add noise to the current reading
          this.currentReadoutProperty.value = this.currentReadoutForCurrent( this.currentProperty.value );
        }
      }
    }
  }

  // Restore the ammeter to its initial conditions
  public override reset(): void {
    super.reset();
    this.currentProperty.reset();
    this.probePositionProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Ammeter', Ammeter );