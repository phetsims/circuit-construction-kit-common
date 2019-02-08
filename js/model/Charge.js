// Copyright 2016-2017, University of Colorado Boulder

/**
 * The model for a single blue charge that moves along a circuit element, depicted as a colored sphere.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Emitter = require( 'AXON/Emitter' );
  const Matrix3 = require( 'DOT/Matrix3' );

  class Charge {

    /**
     * @param {CircuitElement} circuitElement - the circuit element the charge is in.
     * @param {number} distance - how far along the circuit element it has traveled (in screen coordinates)
     * @param {Property.<boolean>} visibleProperty - whether the charge should be shown.
     * @param {number} charge - +1 for conventional current and -1 for electrons
     */
    constructor( circuitElement, distance, visibleProperty, charge ) {

      assert && assert( charge === 1 || charge === -1, 'charge should be 1 or -1' );

      // @public (read-only) {number} the amount of charge
      this.charge = charge;

      // Validate inputs
      assert && assert( _.isNumber( distance ), 'distance should be a number' );
      assert && assert( distance >= 0, 'charge was below the origin of the circuit element' );
      assert && assert( circuitElement.containsScalarLocation( distance ), 'charge was not within the circuit element' );

      // @public (read-only) {CircuitElement} - the CircuitElement the Charge is in, changed by Charge.setLocation
      this.circuitElement = circuitElement;

      // @public (read-only) {number} - the distance the charge has traveled in its CircuitElement in view coordinates
      this.distance = distance;

      // @public (read-only) {Matrix3} - rotation and translation for the charge
      this.matrix = Matrix3.identity();

      // @public (read-only) {Property.<boolean>} - whether the charge should be displayed
      this.visibleProperty = visibleProperty;

      // @public (read-only) {Emitter} Indicate when the position and/or angle changed
      this.changedEmitter = new Emitter();

      // @public (read-only) {Emitter} send notifications when the charge is disposed, so the view can be disposed.
      this.disposeEmitter = new Emitter();

      this.updatePositionAndAngle();
    }

    /**
     * After updating the circuit element and/or distance traveled, update the 2d position and direction.
     * @public
     */
    updatePositionAndAngle() {
      assert && assert( !isNaN( this.distance ), 'charge position was not a number' );
      this.circuitElement.updateMatrixForPoint( this.distance, this.matrix );

      // Notify listeners that the position and angle have changed.
      this.changedEmitter.emit();
    }

    /**
     * Dispose the charge when it will never be used again.
     * @public
     */
    dispose() {
      this.disposeEmitter.emit();
      this.disposeEmitter.removeAllListeners();
      this.changedEmitter.dispose();
    }
  }

  return circuitConstructionKitCommon.register( 'Charge', Charge );
} );