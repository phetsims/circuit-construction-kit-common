// Copyright 2016-2022, University of Colorado Boulder

/**
 * The model for a single blue charge that moves along a circuit element, depicted as a colored sphere.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';
import Disposable from '../../../axon/js/Disposable.js';

export default class Charge extends Disposable {

  //the amount of charge
  public readonly charge: number;

  // the CircuitElement the Charge is in, changed by Charge.updatePositionAndAngle
  public circuitElement: CircuitElement;

  // the distance the charge has traveled in its CircuitElement in view coordinates
  public distance: number;

  // rotation and translation for the charge
  public readonly matrix: Matrix3;

  // whether the charge should be displayed
  public readonly visibleProperty: Property<boolean>;

  // Indicate when the position and/or angle changed
  public readonly changedEmitter: TEmitter;

  /**
   * @param circuitElement - the circuit element the charge is in.
   * @param distance - how far along the circuit element it has traveled (in screen coordinates)
   * @param visibleProperty - whether the charge should be shown.
   * @param charge - +1 for conventional current and -1 for electrons
   */
  public constructor( circuitElement: CircuitElement, distance: number, visibleProperty: Property<boolean>, charge: number ) {

    super();

    assert && assert( charge === 1 || charge === -1, 'charge should be 1 or -1' );

    this.charge = charge;

    // Validate inputs
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( distance >= 0, 'charge was below the origin of the circuit element' );
    assert && assert( circuitElement.containsScalarPosition( distance ), 'charge was not within the circuit element' );

    this.circuitElement = circuitElement;
    this.distance = distance;
    this.matrix = Matrix3.identity();
    this.visibleProperty = visibleProperty;
    this.changedEmitter = new Emitter();

    this.updatePositionAndAngle();
  }

  /**
   * After updating the circuit element and/or distance traveled, update the 2d position and direction.
   */
  public updatePositionAndAngle(): void {
    assert && assert( !isNaN( this.distance ), 'charge position was not a number' );
    this.circuitElement.updateMatrixForPoint( this.distance, this.matrix );

    // Notify listeners that the position and angle have changed.
    this.changedEmitter.emit();
  }

  // Dispose the charge when it will never be used again.
  public override dispose(): void {
    this.changedEmitter.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'Charge', Charge );