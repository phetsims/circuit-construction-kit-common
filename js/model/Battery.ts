// Copyright 2015-2026, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import type Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type BatteryType from './BatteryType.js';
import type Vertex from './Vertex.js';
import VoltageSource, { type VoltageSourceOptions } from './VoltageSource.js';

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

  public readonly isTraversableProperty = new BooleanProperty( true );

  public constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, batteryType: BatteryType,
                      tandem: Tandem, providedOptions?: BatteryOptions ) {
    affirm( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const options = optionize<BatteryOptions, EmptySelfOptions, VoltageSourceOptions>()( {
      initialOrientation: 'right',
      voltage: Battery.VOLTAGE_DEFAULT,
      isFlammable: true,
      numberOfDecimalPlaces: batteryType === 'normal' ? Battery.VOLTAGE_DECIMAL_PLACES : Battery.HIGH_VOLTAGE_DECIMAL_PLACES,
      voltagePropertyOptions: {
        range: batteryType === 'normal' ? Battery.VOLTAGE_RANGE : Battery.HIGH_VOLTAGE_RANGE
      }
    }, providedOptions );
    super( 'battery', startVertex, endVertex, internalResistanceProperty, BATTERY_LENGTH, tandem, options );

    this.initialOrientation = options.initialOrientation;
    this.batteryType = batteryType;
    this.isReversibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isReversibleProperty' ),
      phetioFeatured: true
    } );
  }

  public override dispose(): void {
    this.isReversibleProperty.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'Battery', Battery );