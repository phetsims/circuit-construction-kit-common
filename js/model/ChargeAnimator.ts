// Copyright 2016-2022, University of Colorado Boulder

/**
 * This code governs the movement of charges, making sure they are distributed equally among the different
 * CircuitElements.  This exists for the life of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { ObservableArray } from '../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import RunningAverage from '../../../dot/js/RunningAverage.js';
import Utils from '../../../dot/js/Utils.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Charge from './Charge.js';
import Circuit from './Circuit.js';
import CircuitElement from './CircuitElement.js';
import Vertex from './Vertex.js';

// constants

// If the current is lower than this, then there is no charge movement
const MINIMUM_CURRENT = 1E-10;

// The furthest an charge can step in one frame before the time scale must be reduced (to prevent a strobe effect)
const MAX_POSITION_CHANGE = CCKCConstants.CHARGE_SEPARATION * 0.43;

// Number of times to spread out charges so they don't get bunched up.
const NUMBER_OF_EQUALIZE_STEPS = 2;

// Factor that multiplies the current to attain speed in screen coordinates per second
// No longer manually tuned so that at 1 Amp, 1 charge flows past in 1 second
const SPEED_SCALE = 25;

// the highest allowable time step for integration
const MAX_DT = 1 / 30;

type CircuitElementPosition = {
  circuitElement: CircuitElement;
  distance: number;
  distanceToClosestElectron: number;
};

/**
 * Gets the absolute value of the current in a circuit element.
 */
const CURRENT_MAGNITUDE = function( circuitElement: CircuitElement ) {
  return Math.abs( circuitElement.currentProperty.get() );
};

export default class ChargeAnimator {
  private readonly charges: ObservableArray<Charge>;
  private readonly circuit: Circuit;

  // factor that reduces the overall propagator speed when maximum speed is exceeded
  private scale: number;

  // a running average over last time steps as a smoothing step
  public readonly timeScaleRunningAverage: RunningAverage;

  // how much the time should be slowed, 1 is full speed, 0.5 is running at half speed, etc.
  public readonly timeScaleProperty: NumberProperty;

  public constructor( circuit: Circuit ) {
    this.charges = circuit.charges;
    this.circuit = circuit;
    this.scale = 1;
    this.timeScaleRunningAverage = new RunningAverage( 30 );
    this.timeScaleProperty = new NumberProperty( 1, { range: new Range( 0, 1 ) } );
  }

  // Restores to the initial state
  public reset(): void {
    this.timeScaleProperty.reset();
    this.timeScaleRunningAverage.clear();
  }

  /**
   * Update the position of the charges based on the circuit currents
   * @param dt - elapsed time in seconds
   */
  public step( dt: number ): void {

    if ( this.charges.length === 0 || this.circuit.circuitElements.length === 0 ) {
      return;
    }

    // dt would ideally be around 16.666ms = 0.0166 sec.  Cap it to avoid too large of an integration step.
    dt = Math.min( dt, MAX_DT );

    // Find the fastest current in any circuit element
    const maxCircuitElement = _.maxBy( this.circuit.circuitElements, CURRENT_MAGNITUDE )!;
    const maxCurrentMagnitude = CURRENT_MAGNITUDE( maxCircuitElement );
    assert && assert( maxCurrentMagnitude >= 0, 'max current should be positive' );

    const maxSpeed = maxCurrentMagnitude * SPEED_SCALE;
    const maxPositionChange = maxSpeed * MAX_DT; // Use the max dt instead of the true dt to avoid fluctuations

    // Slow down the simulation if the fastest step distance exceeds the maximum allowed step
    this.scale = ( maxPositionChange >= MAX_POSITION_CHANGE ) ? ( MAX_POSITION_CHANGE / maxPositionChange ) : 1;

    // Average over scale values to smooth them out
    const averageScale = Utils.clamp( this.timeScaleRunningAverage.updateRunningAverage( this.scale ), 0, 1 );
    this.timeScaleProperty.set( averageScale );

    for ( let i = 0; i < this.charges.length; i++ ) {
      const charge = this.charges[ i ];

      // Don't update charges in chargeLayoutDirty circuit elements, because they will get a relayout anyways
      if ( !charge.circuitElement.chargeLayoutDirty ) {
        this.propagate( charge, dt );
      }
    }

    // Spread out the charges so they don't bunch up
    for ( let i = 0; i < NUMBER_OF_EQUALIZE_STEPS; i++ ) {
      this.equalizeAll( dt );
    }

    // After computing the new charge positions (possibly across several deltas), trigger the views to update.
    this.charges.forEach( charge => charge.updatePositionAndAngle() );
  }

  /**
   * Make the charges repel each other so they don't bunch up.
   * @param dt - the elapsed time in seconds
   */
  private equalizeAll( dt: number ): void {

    // Update them in a stochastic order to avoid systematic sources of error building up.
    const indices = dotRandom.shuffle( _.range( this.charges.length ) );
    for ( let i = 0; i < this.charges.length; i++ ) {
      const charge = this.charges[ indices[ i ] ];

      // No need to update charges in chargeLayoutDirty circuit elements, they will be replaced anyways.  Skipping
      // chargeLayoutDirty circuitElements improves performance.  Also, only update electrons in circuit elements
      // that have a current (to improve performance)
      if ( !charge.circuitElement.chargeLayoutDirty && Math.abs( charge.circuitElement.currentProperty.get() ) >= MINIMUM_CURRENT ) {
        this.equalizeCharge( charge, dt );
      }
    }
  }

  /**
   * Adjust the charge so it is more closely centered between its neighbors.  This prevents charges from getting
   * too bunched up.
   * @param charge - the charge to adjust
   * @param dt - seconds
   */
  private equalizeCharge( charge: Charge, dt: number ): void {

    const circuitElementCharges = this.circuit.getChargesInCircuitElement( charge.circuitElement );

    // if it has a lower and upper neighbor, nudge the charge to be closer to the midpoint
    const sorted = _.sortBy( circuitElementCharges, 'distance' );

    const chargeIndex = sorted.indexOf( charge );
    const upper = sorted[ chargeIndex + 1 ];
    const lower = sorted[ chargeIndex - 1 ];

    // Only adjust a charge if it is between two other charges
    if ( upper && lower ) {
      const neighborSeparation = upper.distance - lower.distance;
      const currentPosition = charge.distance;

      let desiredPosition = lower.distance + neighborSeparation / 2;
      const distanceFromDesiredPosition = Math.abs( desiredPosition - currentPosition );
      const sameDirectionAsCurrent = Math.sign( desiredPosition - currentPosition ) ===
                                     Math.sign( -charge.circuitElement.currentProperty.get() * charge.charge );

      // never slow down or run the current backwards
      if ( sameDirectionAsCurrent ) {

        // When we need to correct in the same direction as current flow, do it quickly.
        const correctionStepSize = Math.abs( 5.5 / NUMBER_OF_EQUALIZE_STEPS * SPEED_SCALE * dt );

        // If far enough away that it won't overshoot, then correct it with one step
        if ( distanceFromDesiredPosition > correctionStepSize ) {

          // move in the appropriate direction maxDX
          if ( desiredPosition < currentPosition ) {
            desiredPosition = currentPosition - correctionStepSize;
          }
          else if ( desiredPosition > currentPosition ) {
            desiredPosition = currentPosition + correctionStepSize;
          }
        }

        // Only update the charge if its new position would be within the same circuit element.
        if ( desiredPosition >= 0 && desiredPosition <= charge.circuitElement.chargePathLength ) {
          charge.distance = desiredPosition;
        }
      }
    }
  }

  /**
   * Move the charge forward in time by the specified amount.
   * @param charge - the charge to update
   * @param dt - elapsed time in seconds
   */
  private propagate( charge: Charge, dt: number ): void {
    const chargePosition = charge.distance;
    assert && assert( _.isNumber( chargePosition ), 'distance along wire should be a number' );
    const current = -charge.circuitElement.currentProperty.get() * charge.charge;

    // Below min current, the charges should remain stationary
    if ( Math.abs( current ) > MINIMUM_CURRENT ) {
      const speed = current * SPEED_SCALE;
      const chargePositionDelta = speed * dt * this.scale;
      const newChargePosition = chargePosition + chargePositionDelta;

      // Step within a single circuit element
      if ( charge.circuitElement.containsScalarPosition( newChargePosition ) ) {
        charge.distance = newChargePosition;
      }
      else {

        // move to a new CircuitElement
        const overshoot = current < 0 ?
                          -newChargePosition :
                          ( newChargePosition - charge.circuitElement.chargePathLength );
        const lessThanBeginningOfOldCircuitElement = newChargePosition < 0;

        assert && assert( !isNaN( overshoot ), 'overshoot should be a number' );
        assert && assert( overshoot >= 0, 'overshoot should be >=0' );

        // enumerate all possible circuit elements the charge could go to
        const vertex = lessThanBeginningOfOldCircuitElement ?
                       charge.circuitElement.startVertexProperty.get() :
                       charge.circuitElement.endVertexProperty.get();
        const circuitPositions = this.getPositions( charge, overshoot, vertex, 0 );
        if ( circuitPositions.length > 0 ) {

          // choose the CircuitElement with the furthest away electron
          const chosenCircuitPosition = _.maxBy( circuitPositions, 'distanceToClosestElectron' )!;
          assert && assert( chosenCircuitPosition.distanceToClosestElectron >= 0, 'distanceToClosestElectron should be >=0' );
          charge.circuitElement = chosenCircuitPosition.circuitElement;
          charge.distance = chosenCircuitPosition.distance;
        }
      }
    }
  }

  /**
   * Returns the positions where a charge can flow to (connected circuits with current flowing in the right direction)
   * @param charge - the charge that is moving
   * @param overshoot - the distance the charge should appear along the next circuit element
   * @param vertex - vertex the charge is passing by
   * @param depth - number of recursive calls
   */
  private getPositions( charge: Charge, overshoot: number, vertex: Vertex, depth: number ): CircuitElementPosition[] {

    const circuit = this.circuit;

    const adjacentCircuitElements = this.circuit.getNeighborCircuitElements( vertex );
    const circuitPositions: CircuitElementPosition[] = [];

    // Keep only those with outgoing current.
    for ( let i = 0; i < adjacentCircuitElements.length; i++ ) {
      const circuitElement = adjacentCircuitElements[ i ];
      const current = -circuitElement.currentProperty.get() * charge.charge;
      let distance = null;

      // The linear algebra solver can result in currents of 1E-12 where it should be zero.  For these cases, don't
      // permit charges to flow. The current is clamped here instead of after the linear algebra so that we don't
      // mess up support for oscillating elements that may need the small values such as capacitors and inductors.
      let found = false;
      if ( current > MINIMUM_CURRENT && circuitElement.startVertexProperty.get() === vertex ) {

        // Start near the beginning.
        distance = Utils.clamp( overshoot, 0, circuitElement.chargePathLength ); // Note, this can be zero
        found = true;
      }
      else if ( current < -MINIMUM_CURRENT && circuitElement.endVertexProperty.get() === vertex ) {

        // start near the end
        distance = Utils.clamp( circuitElement.chargePathLength - overshoot, 0, circuitElement.chargePathLength ); // can be zero
        found = true;
      }
      else {

        // Current too small to animate
      }

      if ( found ) {
        const charges = circuit.getChargesInCircuitElement( circuitElement );
        assert && assert(
          circuitElement.startVertexProperty.get() === vertex ||
          circuitElement.endVertexProperty.get() === vertex
        );
        const atStartOfNewCircuitElement = circuitElement.startVertexProperty.get() === vertex;
        let distanceToClosestElectron = 0;
        if ( charges.length > 0 ) {

          // find closest electron to the vertex
          if ( atStartOfNewCircuitElement ) {
            distanceToClosestElectron = ( _.minBy( charges, 'distance' )! ).distance;
          }
          else {
            distanceToClosestElectron = circuitElement.chargePathLength - ( _.maxBy( charges, 'distance' )! ).distance;
          }

          assert && assert( distance !== null, 'distance should be a number' );

          if ( typeof distance === 'number' ) {
            circuitPositions.push( {
              circuitElement: circuitElement,
              distance: distance,
              distanceToClosestElectron: distanceToClosestElectron
            } );
          }
        }
        else if ( depth < 20 ) {

          // check downstream circuit elements, but only if we haven't recursed too far (just in case)
          const positions = this.getPositions( charge, 0, circuitElement.getOppositeVertex( vertex ), depth + 1 );

          if ( positions.length > 0 ) {

            // find the one with the closest electron
            const nearest = _.minBy( positions, 'distanceToClosestElectron' )!;
            assert && assert( distance !== null, 'distance should be a number' );
            if ( typeof distance === 'number' ) {
              circuitPositions.push( {
                circuitElement: circuitElement,
                distance: distance,
                distanceToClosestElectron: nearest.distanceToClosestElectron + circuitElement.chargePathLength
              } );
            }
          }
        }
      }
    }
    return circuitPositions;
  }
}

circuitConstructionKitCommon.register( 'ChargeAnimator', ChargeAnimator );