// Copyright 2015-2023, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import BatteryType from './BatteryType.js';
import Circuit from './Circuit.js';
import Vertex from './Vertex.js';
import VoltageSource, { VoltageSourceOptions } from './VoltageSource.js';

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;

type BatteryOptions = VoltageSourceOptions;

export default class Battery extends VoltageSource {
  public readonly batteryType: BatteryType;
  public static readonly VOLTAGE_DEFAULT = 9.0;
  public static readonly VOLTAGE_RANGE = new Range( 0, 120 );
  public static readonly VOLTAGE_DECIMAL_PLACES = 1;
  public static readonly HIGH_VOLTAGE_DEFAULT = 1000;
  public static readonly HIGH_VOLTAGE_RANGE = new Range( 100, 100000 );
  public static readonly HIGH_VOLTAGE_DECIMAL_PLACES = 0;
  public readonly isReversibleProperty: BooleanProperty;

  public constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, batteryType: BatteryType,
                      tandem: Tandem, providedOptions?: BatteryOptions ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const options = optionize<BatteryOptions, EmptySelfOptions, VoltageSourceOptions>()( {
      initialOrientation: 'right',
      voltage: Battery.VOLTAGE_DEFAULT,
      isFlammable: true,
      numberOfDecimalPlaces: batteryType === 'normal' ? Battery.VOLTAGE_DECIMAL_PLACES : Battery.HIGH_VOLTAGE_DECIMAL_PLACES,
      voltagePropertyOptions: {
        range: batteryType === 'normal' ? Battery.VOLTAGE_RANGE : Battery.HIGH_VOLTAGE_RANGE
      }
    }, providedOptions );
    super( startVertex, endVertex, internalResistanceProperty, BATTERY_LENGTH, tandem, options );

    this.initialOrientation = options.initialOrientation;
    this.batteryType = batteryType;
    this.isReversibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isReversibleProperty' ),
      phetioFeatured: true
    } );
  }

  public override step( time: number, dt: number, circuit: Circuit ): void {
    // nothing to do
  }

  public override dispose(): void {
    this.isReversibleProperty.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'Battery', Battery );