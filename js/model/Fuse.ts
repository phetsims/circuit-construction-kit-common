// Copyright 2019-2026, University of Colorado Boulder

/**
 * Model for a fuse. This circuit element trips (i.e., becomes very high resistance) when its current rating is
 * exceeded.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Property from '../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../dot/js/Range.js';
import optionize from '../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import breakFuse_mp3 from '../../sounds/breakFuse_mp3.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type Circuit from './Circuit.js';
import FixedCircuitElement, { type FixedCircuitElementOptions } from './FixedCircuitElement.js';
import type Vertex from './Vertex.js';

type SelfOptions = {
  fuseLength?: number;
  currentRating?: number;
};

type FuseOptions = SelfOptions & FixedCircuitElementOptions;

const breakFuseSoundClip = new SoundClip( breakFuse_mp3 );
// const repairFuseSoundClip = new SoundClip( repairFuse_mp3 );
soundManager.addSoundGenerator( breakFuseSoundClip );
// soundManager.addSoundGenerator( repairFuseSoundClip );

export default class Fuse extends FixedCircuitElement {

  // the current at which the fuse trips, in amps
  public readonly currentRatingProperty: NumberProperty;

  // true if the fuse is tripped
  public readonly isTrippedProperty: BooleanProperty;

  // the resistance in ohms.  Computed in step() as a function of isTrippedProperty and currentRatingProperty.  Computed
  // in step instead of as a DerivedProperty to avoid a re-entrant loop, see https://github.com/phetsims/circuit-construction-kit-common/issues/480#issuecomment-483430822
  public readonly resistanceProperty: NumberProperty;
  private timeCurrentRatingExceeded: number;

  // Track previous resistance to only mark circuit dirty when it changes
  private previousResistance: number;

  public readonly isRepairableProperty: BooleanProperty;

  public readonly isTraversableProperty: TReadOnlyProperty<boolean>;

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, circuit: Circuit | null, providedOptions?: FuseOptions ) {
    const options = optionize<FuseOptions, SelfOptions, FixedCircuitElementOptions>()( {
      fuseLength: CCKCConstants.RESISTOR_LENGTH, // Same length as a resistor
      currentRating: Fuse.DEFAULT_CURRENT_RATING, // Amps
      isCurrentReentrant: true, // Changing the current can trip a fuse, which changes the current
      numberOfDecimalPlaces: 1
    }, providedOptions );

    super( 'fuse', startVertex, endVertex, options.fuseLength, tandem, options );

    this.currentRatingProperty = new NumberProperty( options.currentRating, {
      range: Fuse.RANGE,
      tandem: tandem.createTandem( 'currentRatingProperty' ),
      phetioFeatured: true
    } );

    this.isTrippedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isTrippedProperty' ),
      phetioFeatured: true
    } );

    this.isTraversableProperty = DerivedProperty.not( this.isTrippedProperty );

    this.resistanceProperty = new NumberProperty( CCKCConstants.MINIMUM_RESISTANCE );

    // time in seconds the current rating has been exceeded
    this.timeCurrentRatingExceeded = 0;

    this.previousResistance = this.resistanceProperty.value;

    this.isRepairableProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isRepairableProperty' ),
      phetioFeatured: true
    } );

    this.isTrippedProperty.lazyLink( isTripped => {
      circuit && circuit.componentEditedEmitter.emit();

      if ( isTripped ) {
        breakFuseSoundClip.play();
      }
      // else {
      //   repairFuseSoundClip.play();
      // }
    } );
  }

  public override dispose(): void {
    super.dispose();
    this.currentRatingProperty.dispose();
    this.isRepairableProperty.dispose();
    this.isTrippedProperty.dispose();
  }

  /**
   * Reset the fuse so it is no longer tripped.
   */
  public resetFuse(): void {
    this.isTrippedProperty.reset();
    this.timeCurrentRatingExceeded = 0;
  }

  /**
   * @param time - total elapsed time. Unused, but provided to match signature defined in body of Circuit.step
   * @param dt - delta between last frame and current frame
   * @param circuit
   */
  public step( time: number, dt: number, circuit: Circuit ): void {

    // When the current exceeds the max, trip the fuse. This cannot be modeled as a property link because it
    // creates a reentrant property loop which doesn't update the reset fuse button properly.
    // Account for roundoff error in the circuit solve step.
    const currentRatingExceeded = Math.abs( this.currentProperty.value ) > this.currentRatingProperty.value + 1E-6;

    // If not exceeded, the fuse "cools off" right away.
    if ( currentRatingExceeded ) {
      this.timeCurrentRatingExceeded += dt;
    }
    else {
      this.timeCurrentRatingExceeded = 0;
    }

    // Trip the fuse if it has exceeded the current rating beyond the threshold time
    if ( this.timeCurrentRatingExceeded > 0.0 ) {
      this.isTrippedProperty.value = true;
    }

    // The resistance varies inversely with the current rating, with 20.0 A at 3 mΩ.
    const newResistance = this.isTrippedProperty.value ? CCKCConstants.MAX_RESISTANCE :
                          1 / this.currentRatingProperty.value * 0.06;

    // Only mark dirty when resistance actually changes to avoid unnecessary circuit solving.
    // This captures all salient changes: isTripped changes cause resistance changes,
    // currentRating changes cause resistance changes. The solver only relies on resistance values.
    if ( newResistance !== this.previousResistance ) {
      circuit.dirty = true;
      this.previousResistance = newResistance;
    }

    this.resistanceProperty.value = newResistance;
  }

  /**
   * Get the properties that, when changed, require the circuit to be re-solved.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.resistanceProperty, this.isTrippedProperty ];
  }

  public static readonly RANGE = new Range( 0.5, 20 );
  public static readonly DEFAULT_CURRENT_RATING = 4;
}

circuitConstructionKitCommon.register( 'Fuse', Fuse );