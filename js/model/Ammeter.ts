// Copyright 2016-2023, University of Colorado Boulder

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
import AmmeterConnection from './AmmeterConnection.js';
import CircuitElement from './CircuitElement.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';

export default class Ammeter extends Meter {

  // the full-precision reading on the ammeter. It will be formatted for display in the view.  Null means the ammeter is not on a wire.
  public readonly currentProperty: Property<number | null>;

  // the position of the tip of the probe
  public readonly probePositionProperty: Property<Vector2>;
  private readonly probeConnectionProperty: Property<CircuitElement | null>;

  public constructor( tandem: Tandem, phetioIndex: number ) {
    super( tandem, phetioIndex );

    this.currentProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'currentProperty' ),
      units: 'A',
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true
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
  }

  public setConnectionAndCurrent( ammeterConnection: AmmeterConnection | null ): void {
    this.currentProperty.value = ammeterConnection === null ? null : ammeterConnection.current;
    this.probeConnectionProperty.value = ammeterConnection === null ? null : ammeterConnection.circuitElement;
  }

  // Restore the ammeter to its initial conditions
  public override reset(): void {
    super.reset();
    this.currentProperty.reset();
    this.probePositionProperty.reset();
  }
}

circuitConstructionKitCommon.register( 'Ammeter', Ammeter );