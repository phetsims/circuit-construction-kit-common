// Copyright 2016-2021, University of Colorado Boulder

/**
 * Model for the Ammeter, which adds the probe position and current readout.  There is only one ammeter per screen and
 * it is shown/hidden.  Hence it does not need a dispose() implementation.
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

class Ammeter extends Meter {
  private readonly currentProperty: Property<null>;
  private readonly probePositionProperty: Vector2Property;

  /**
   * @param {Tandem} tandem
   * @param {number} phetioIndex
   */
  constructor( tandem: Tandem, phetioIndex: number ) {
    super( tandem, phetioIndex );

    // public (read-only) {number} - lightweight index for naming the tandem view correspondingly
    this.phetioIndex = phetioIndex;

    // @public {Property.<number|null>} the full-precision reading on the ammeter. It will be formatted for
    // display in the view.  Null means the ammeter is not on a wire.
    this.currentProperty = new Property( null, {
      tandem: tandem.createTandem( 'currentProperty' ),
      units: 'A',
      phetioType: Property.PropertyIO( NullableIO( NumberIO ) )
    } );

    // @public - the position of the tip of the probe
    this.probePositionProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'probePositionProperty' )
    } );
  }

  /**
   * Restore the ammeter to its initial conditions
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.currentProperty.reset();
    this.probePositionProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Ammeter', Ammeter );
export default Ammeter;