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
import Meter, { sensorDisplayUpdatePeriodProperty } from './Meter.js';
import type AmmeterConnection from './AmmeterConnection.js';
import CircuitElement from './CircuitElement.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import measuringDeviceNoiseProperty from './measuringDeviceNoiseProperty.js';

const MEASURING_DEVICE_NOISE = 0.02; // Amperes

export default class Ammeter extends Meter {

  // the full-precision reading on the ammeter. It will be formatted for display in the view.  Null means the ammeter is not on a wire.
  public readonly currentProperty: Property<number | null>;

  // the current the probe is displaying (in amperes) or null if unconnected
  public readonly currentReadoutProperty: Property<number | null>;

  // the position of the tip of the probe
  public readonly probePositionProperty: Property<Vector2>;
  private readonly probeConnectionProperty: Property<CircuitElement | null>;

  private displayedValueUpdateTimer = 0;

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

    // If the measured current goes from null to non-null or vice-versa, eagerly update the displayed value
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

  public setConnectionAndCurrent( ammeterConnection: AmmeterConnection | null ): void {
    this.currentProperty.value = ammeterConnection === null ? null : ammeterConnection.current;
    this.probeConnectionProperty.value = ammeterConnection === null ? null : ammeterConnection.circuitElement;
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
    if ( this.isActiveProperty.value ) {

      // Advance the noise timer, and if it is time to make noise, do so
      this.displayedValueUpdateTimer += dt;

      if ( this.displayedValueUpdateTimer > sensorDisplayUpdatePeriodProperty.value ) {
        this.displayedValueUpdateTimer = 0;

        if ( this.currentProperty.value !== null ) {

          // Incorporate any measurement noise in the ammeter readout
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