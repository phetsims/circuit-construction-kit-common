// Copyright 2016, University of Colorado Boulder

/**
 * The model for a single blue charge that moves along a circuit element, depicted as a colored sphere.
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Property = require( 'AXON/Property' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {CircuitElement} circuitElement - the circuit element the charge is in.
   * @param {number} distance - how far along the circuit element it has traveled (in screen coordinates)
   * @param {Property.<boolean>} visibleProperty - whether the charge should be shown.
   * @param {number} charge - +1 for conventional current and -1 for electrons
   * @constructor
   */
  function Charge( circuitElement, distance, visibleProperty, charge ) {

    assert && assert( charge === 1 || charge === -1, 'charge should be 1 or -1' );

    // @public (read-only) the amount of charge
    this.charge = charge;

    // Validate inputs
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( distance >= 0, 'charge was below the origin of the circuit element' );
    assert && assert( circuitElement.containsScalarLocation( distance ), 'charge was not within the circuit element' );

    var self = this;

    // @public (read-only), the CircuitElement the Charge is in
    this.circuitElement = circuitElement;

    // @private - whether the charge has been disposed to aid in debugging
    this.deleted = false;

    // @public - the distance the charge has traveled in its CircuitElement
    this.distanceProperty = new NumberProperty( distance );

    // @public (read-only) - To improve performance, disable updating while the position of the charge is changed many
    // times during the update step.
    this.updatingPositionProperty = new BooleanProperty( true );

    // @public the 2d position of the charge
    this.positionProperty = new Property( new Vector2() );

    // When the distance or updating properties change, update the 2d position of the charge
    var multilink = Property.multilink( [ this.distanceProperty, this.updatingPositionProperty ], function( distance, updating ) {
      if ( updating ) {
        assert && assert( !self.deleted, 'Charge was deleted' );
        assert && assert( !isNaN( distance ), 'charge position was not a number' );
        var positionAndAngle = self.circuitElement.getPositionAndAngle( distance );
        var position = positionAndAngle.position;
        assert && assert( !isNaN( position.x ) && !isNaN( position.y ), 'point was not a number' );
        self.angle = positionAndAngle.angle;
        self.positionProperty.set( position ); // TODO: set position and angle together?
      }
    } );

    // @public (read-only) whether the charge should be displayed
    this.visibleProperty = visibleProperty;

    // @public (read-only) send notifications when the charge is disposed, so the view can be disposed.
    this.disposeEmitter = new Emitter();

    this.disposeCharge = function() {

      assert && assert( !self.deleted, 'cannot delete twice' );
      multilink.dispose();
      self.deleted = true;
      self.disposeEmitter.emit();
      assert && assert( !self.disposeEmitter.hasListeners(), 'after disposal, should have no listeners' );
    };
  }

  circuitConstructionKitCommon.register( 'Charge', Charge );

  return inherit( Object, Charge, {

    /**
     * Dispose the charge when it will never be used again.
     */
    dispose: function() {
      this.disposeCharge();
    },

    /**
     * Set the Charge to be in a new place in the circuit.
     * @param {CircuitElement} circuitElement - the new CircuitElement the charge will be in.
     * @param {number} distance - the position within the new CircuitElement
     */
    setLocation: function( circuitElement, distance ) {
      assert && assert( !isNaN( distance ), 'Distance was NaN' );
      assert && assert( circuitElement.containsScalarLocation( distance ), 'no location in branch' );
      this.circuitElement = circuitElement;
      this.distanceProperty.set( distance );
    }
  } );
} );