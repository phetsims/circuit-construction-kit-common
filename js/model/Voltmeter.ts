// Copyright 2016-2025, University of Colorado Boulder

/**
 * The model for a voltmeter, which has a red and black probe and reads out voltage between vertices/wires. Exists
 * for the life of the sim and hence a dispose implementation is not needed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Meter from './Meter.js';
import VoltageConnection from './VoltageConnection.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import measuringDeviceNoiseProperty from './measuringDeviceNoiseProperty.js';

const MEASURING_DEVICE_NOISE = 0.05; // Standard deviation of the measurement uncertainty (Volts)
const DISPLAYED_VALUE_UPDATE_PERIOD = 0.75; // Update rate of the instrument (seconds)

export default class Voltmeter extends Meter {

  // the voltage the probe is reading (in volts) or null if unconnected
  public readonly voltageProperty: Property<number | null>;

  // the voltage the probe is displaying (in volts) or null if unconnected
  public readonly voltageReadoutProperty: Property<number | null>;

  // the position of the tip of the red probe in model=view coordinates
  public readonly redProbePositionProperty: Vector2Property;

  // the position of the black probe in model=view coordinates
  public readonly blackProbePositionProperty: Vector2Property;

  public readonly blackProbeConnectionProperty: Property<VoltageConnection | null>;
  public readonly redProbeConnectionProperty: Property<VoltageConnection | null>;

  private displayedValueUpdateTimer = 0;

  public constructor( tandem: Tandem, phetioIndex: number ) {
    super( tandem, phetioIndex );

    this.voltageProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      units: 'V',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.voltageReadoutProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'voltageReadoutProperty' ),
      units: 'V',
      phetioValueType: NullableIO( NumberIO )
    } );

    this.redProbePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'redProbePositionProperty' ),
      phetioFeatured: true
    } );

    this.blackProbePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'blackProbePositionProperty' ),
      phetioFeatured: true
    } );

    this.blackProbeConnectionProperty = new Property<VoltageConnection | null>( null, {
      tandem: tandem.createTandem( 'blackProbeConnectionProperty' ),
      phetioValueType: NullableIO( VoltageConnection.VoltageConnectionIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.redProbeConnectionProperty = new Property<VoltageConnection | null>( null, {
      tandem: tandem.createTandem( 'redProbeConnectionProperty' ),
      phetioValueType: NullableIO( VoltageConnection.VoltageConnectionIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.isActiveProperty.link( isActive => {
      if ( !isActive ) {
        this.blackProbeConnectionProperty.value = null;
        this.redProbeConnectionProperty.value = null;
      }
    } );

    this.voltageProperty.link( ( voltage, previousVoltage ) => {
      if ( ( voltage === null ) !== ( previousVoltage === null ) || !measuringDeviceNoiseProperty.value ) {
        if ( measuringDeviceNoiseProperty.value ) {
          this.displayedValueUpdateTimer = 0; // Reset the display update timer when the voltage is updated
          this.voltageReadoutProperty.value = this.voltageReadoutForVoltage( voltage );
        }
        else {
          this.voltageReadoutProperty.value = voltage;
        }
      }
    } );

    measuringDeviceNoiseProperty.link( measuringDeviceNoise => {
      if ( measuringDeviceNoise ) {
        this.displayedValueUpdateTimer = 0; // Reset the display update timer when the voltage is updated
        this.voltageReadoutProperty.value = this.voltageReadoutForVoltage( this.voltageProperty.value );
      }
      else {
        this.voltageReadoutProperty.value = this.voltageProperty.value;
      }
    } );
  }

  private voltageReadoutForVoltage( voltage: number | null ): number | null {
    if ( voltage === null ) {
      return null;
    }
    else if ( measuringDeviceNoiseProperty.value ) {

      // Add the measurement noise to the instrument reading
      return voltage + MEASURING_DEVICE_NOISE * dotRandom.nextGaussian();
    }
    else {
      return voltage;
    }
  }

  public stepDisplayUpdateTimer( dt: number ): void {
    if ( this.isActiveProperty.value ) {

      // Advance the noise timer, and if it is time to make noise, do so
      this.displayedValueUpdateTimer += dt;

      if ( this.displayedValueUpdateTimer > DISPLAYED_VALUE_UPDATE_PERIOD ) {
        this.displayedValueUpdateTimer = 0;

        if ( this.voltageProperty.value !== null ) {

          // Use dotRandom.nextGaussian to add noise to the voltage reading
          this.voltageReadoutProperty.value = this.voltageReadoutForVoltage( this.voltageProperty.value );
        }
      }
    }
  }

  /**
   * Reset the voltmeter, called when reset all is pressed.
   */
  public override reset(): void {
    super.reset();
    this.voltageProperty.reset();
    this.redProbePositionProperty.reset();
    this.blackProbePositionProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );