// Copyright 2016-2017, University of Colorado Boulder

/**
 * The model for a single blue charge that moves along a circuit element, depicted as a colored sphere.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {CircuitElement} circuitElement - the circuit element the charge is in.
   * @param {number} distance - how far along the circuit element it has traveled (in screen coordinates)
   * @param {Property.<boolean>} visibleProperty - whether the charge should be shown.
   * @param {number} charge - +1 for conventional current and -1 for electrons
   * @constructor
   */
  function Charge( circuitElement, distance, visibleProperty, charge ) {

    assert && assert( charge === 1 || charge === -1, 'charge should be 1 or -1' );

    // @public (read-only) {number} the amount of charge
    this.charge = charge;

    // Validate inputs
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( distance >= 0, 'charge was below the origin of the circuit element' );
    assert && assert( circuitElement.containsScalarLocation( distance ), 'charge was not within the circuit element' );

    var self = this;

    // @public (read-only) {CircuitElement} - the CircuitElement the Charge is in, changed by Charge.setLocation
    this.circuitElement = circuitElement;

    // @public (read-only) {number} - the distance the charge has traveled in its CircuitElement in view coordinates
    this.distance = distance;

    // @public (read-only) {Vector2} - the 2d position of the charge
    this.position = Vector2.ZERO;

    // @public (read-only) {number} - the angle of the charge (for showing arrows)
    this.angle = 0;

    // @public (read-only) {Property.<boolean>} - whether the charge should be displayed
    this.visibleProperty = visibleProperty;

    // @public (read-only) {Emitter} Indicate when the position and/or angle changed
    this.changedEmitter = new Emitter();

    // @public (read-only) {Emitter} send notifications when the charge is disposed, so the view can be disposed.
    this.disposeEmitter = new Emitter();

    this.updatePositionAndAngle();
  }

  circuitConstructionKitCommon.register( 'Charge', Charge );

  return inherit( Object, Charge, {

    /**
     * After updating the circuit element and/or distance traveled, update the 2d position and direction.
     * @public
     */
    updatePositionAndAngle: function() {
      assert && assert( !isNaN( this.distance ), 'charge position was not a number' );
      var positionAndAngle = this.circuitElement.getPositionAndAngle( this.distance );
      this.position = positionAndAngle.position;
      this.angle = positionAndAngle.angle;
      assert && assert( !isNaN( this.position.x ) && !isNaN( this.position.y ), 'point was not a number' );

      // Notify listeners that the position and angle have changed.
      this.changedEmitter.emit();
    },

    /**
     * Dispose the charge when it will never be used again.
     * @public
     */
    dispose: function() {
      this.disposeEmitter.emit();
      this.disposeEmitter.removeAllListeners();
      this.changedEmitter.dispose();
    }
  } );
} );