// Copyright 2019, University of Colorado Boulder

/**
 * Model for a fuse. This circuit element trips (i.e., becomes very high resistance) when its current rating is
 * exceeded.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement from './FixedCircuitElement.js';

class Fuse extends FixedCircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, tandem, options ) {
    options = merge( {
      resistance: CCKCConstants.MINIMUM_RESISTANCE,
      fuseLength: CCKCConstants.RESISTOR_LENGTH, // Same length as a resistor
      currentRating: 4, // Amps
      isCurrentReentrant: true, // Changing the current can trip a fuse, which changes the current
      numberOfDecimalPlaces: 1
    }, options );

    super( startVertex, endVertex, options.fuseLength, tandem, options );

    // @public {Property.<number>} the current at which the fuse trips, in amps
    this.currentRatingProperty = new NumberProperty( options.currentRating, {
      range: new Range( 0.5, 20 )
    } );

    // @public {Property.<boolean>} - true if the fuse is tripped
    this.isTrippedProperty = new BooleanProperty( false );

    // @public {Property.<number>} the resistance in ohms.  Computed in step() as a function of isTrippedProperty and
    // currentRatingProperty.  Computed in step instead of as a DerivedProperty to avoid a re-entrant loop,
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/480#issuecomment-483430822
    this.resistanceProperty = new NumberProperty( CCKCConstants.MINIMUM_RESISTANCE );

    // @private {number} - time in seconds the current rating has been exceeded
    this.timeCurrentRatingExceeded = 0;
  }

  /**
   * Reset the fuse so it is no longer tripped.
   * @public
   */
  resetFuse() {
    this.isTrippedProperty.reset();
    this.timeCurrentRatingExceeded = 0;
  }

  /**
   * @param {number} time - total elapsed time. Unused, but provided to match signature defined in body of Circuit.step
   * @param {number} dt - delta between last frame and current frame
   * @public
   */
  step( time, dt ) {
    // When the current exceeds the max, trip the fuse.  This cannot be modeled as a property link because it
    // creates a reentrant property loop which doesn't update the reset fuse button properly
    // Account for roundoff error in the circuit solve step
    const currentRatingExceeded = Math.abs( this.currentProperty.value ) > this.currentRatingProperty.value + 1E-6;

    // If not exceeded, the fuse "cools off" right away.
    if ( currentRatingExceeded ) {
      this.timeCurrentRatingExceeded += dt;
    }
    else {
      this.timeCurrentRatingExceeded = 0;
    }

    // Trip the fuse if it has exceeded the current rating beyond the threshold time
    if ( this.timeCurrentRatingExceeded > 0.1 ) {
      this.isTrippedProperty.value = true;
    }

    // The resistance varies inversely with the current rating, with 20.0 A at 3 mΩ.
    this.resistanceProperty.value = this.isTrippedProperty.value ? CCKCConstants.MAX_RESISTANCE :
                                    1 / this.currentRatingProperty.value * 0.06;
  }

  /**
   * Get the properties that, when changed, require the circuit to be re-solved.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.resistanceProperty, this.isTrippedProperty ];
  }
}

circuitConstructionKitCommon.register( 'Fuse', Fuse );
export default Fuse;