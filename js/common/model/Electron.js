// Copyright 2016, University of Colorado Boulder

/**
 * The model for a single blue electron that moves along a circuit element, depicted as a colored sphere.
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
   * @param {CircuitElement} circuitElement - the circuit element the electron is in.
   * @param {number} distance - how far along the circuit element it has traveled (in screen coordinates)
   * @param {Property.<boolean>} visibleProperty - whether the electron should be shown.
   * @constructor
   */
  function Electron( circuitElement, distance, visibleProperty ) {

    // Validate inputs
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( distance >= 0, 'electron was below the origin of the circuit element' );
    assert && assert( circuitElement.containsScalarLocation( distance ), 'electron was not within the circuit element' );

    var self = this;

    // @public (read-only), the CircuitElement the Electron is in
    this.circuitElement = circuitElement;

    // @private - whether the electron has been disposed to aid in debugging
    this.deleted = false;

    // @public - the distance the electron has traveled in its CircuitElement
    this.distanceProperty = new NumberProperty( distance );

    // @public (read-only) - To improve performance, disable updating while the position of the electron is changed many
    // times during the update step.  TODO: use temporary values for this instead
    this.updatingPositionProperty = new BooleanProperty( true );

    // @public the 2d position of the electron
    this.positionProperty = new Property( new Vector2() );

    // When the distance or updating properties change, update the 2d position of the electron
    var multilink = Property.multilink( [ this.distanceProperty, this.updatingPositionProperty ], function( distance, updating ) {
      if ( updating ) {
        assert && assert( !self.deleted, 'Electron was deleted' );
        assert && assert( !isNaN( distance ), 'electron position was not a number' );
        var position = self.circuitElement.getPosition( distance );
        assert && assert( !isNaN( position.x ) && !isNaN( position.y ), 'point was not a number' );
        self.positionProperty.set( position );
      }
    } );

    // @public (read-only) whether the electron should be displayed
    this.visibleProperty = visibleProperty;

    // @public (read-only) send notifications when the electron is disposed, so the view can be disposed.
    this.disposeEmitter = new Emitter();

    this.disposeElectron = function() {

      // TODO: sometimes the electrons are getting disposed twice, we must find out why and fix it
      if ( self.deleted ) {
        return;
      }
      assert && assert( !self.deleted, 'cannot delete twice' );
      multilink.dispose();
      self.deleted = true;
      self.disposeEmitter.emit();
      assert && assert( !self.disposeEmitter.hasListeners(), 'after disposal, should have no listeners' );
    };
  }

  circuitConstructionKitCommon.register( 'Electron', Electron );

  return inherit( Object, Electron, {

    /**
     * Dispose the electron when it will never be used again.
     */
    dispose: function() {
      this.disposeElectron();
    },

    /**
     * Set the Electron to be in a new place in the circuit.
     * @param {CircuitElement} circuitElement - the new CircuitElement the electron will be in.
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