// Copyright 2016-2021, University of Colorado Boulder

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

export default class Voltmeter extends Meter {
  readonly voltageProperty: Property<number | null>;
  readonly redProbePositionProperty: Vector2Property;
  readonly blackProbePositionProperty: Vector2Property;

  /**
   * @param {Tandem} tandem
   * @param {number} phetioIndex
   */
  constructor( tandem: Tandem, phetioIndex: number ) {
    super( tandem, phetioIndex );

    // @public {Property.<number|null>} the voltage the probe is reading (in volts) or null if unconnected
    this.voltageProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      units: 'V',
      phetioType: Property.PropertyIO( NullableIO( NumberIO ) )
    } );

    // @public - the position of the tip of the red probe in model=view coordinates.
    this.redProbePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'redProbePositionProperty' )
    } );

    // @public - the position of the black probe in model=view coordinates
    this.blackProbePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'blackProbePositionProperty' )
    } );
  }

  /**
   * Reset the voltmeter, called when reset all is pressed.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.voltageProperty.reset();
    this.redProbePositionProperty.reset();
    this.blackProbePositionProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );