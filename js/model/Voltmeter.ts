// Copyright 2016-2023, University of Colorado Boulder

/**
 * The model for a voltmeter, which has a red and black probe and reads out voltage between vertices/wires. Exists
 * for the life of the sim and hence a dispose implementation is not needed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Meter from './Meter.js';
import VoltageConnection from './VoltageConnection.js';

export default class Voltmeter extends Meter {

  // the voltage the probe is reading (in volts) or null if unconnected
  public readonly voltageProperty: Property<number | null>;

  // the position of the tip of the red probe in model=view coordinates
  public readonly redProbePositionProperty: Vector2Property;

  // the position of the black probe in model=view coordinates
  public readonly blackProbePositionProperty: Vector2Property;

  public readonly blackConnectionProperty: Property<VoltageConnection | null>;
  public readonly redConnectionProperty: Property<VoltageConnection | null>;

  public constructor( tandem: Tandem, phetioIndex: number ) {
    super( tandem, phetioIndex );

    this.voltageProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      units: 'V',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.redProbePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'redProbePositionProperty' ),
      phetioFeatured: true
    } );

    this.blackProbePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'blackProbePositionProperty' ),
      phetioFeatured: true
    } );

    this.blackConnectionProperty = new Property<VoltageConnection | null>( null, {
      tandem: tandem.createTandem( 'blackProbeConnectionProperty' ),
      phetioValueType: NullableIO( VoltageConnection.VoltageConnectionIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.redConnectionProperty = new Property<VoltageConnection | null>( null, {
      tandem: tandem.createTandem( 'redProbeConnectionProperty' ),
      phetioValueType: NullableIO( VoltageConnection.VoltageConnectionIO ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.isActiveProperty.link( isActive => {
      if ( !isActive ) {
        this.blackConnectionProperty.value = null;
        this.redConnectionProperty.value = null;
      }
    } );
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