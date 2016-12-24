// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The model for a single blue electron that moves along a circuit element, depicted as a colored sphere.
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Property = require( 'AXON/Property' );
  var Emitter = require( 'AXON/Emitter' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {CircuitElement} circuitElement - the circuit element the electron is in.
   * @param {number} distance - how far along the circuit element it has traveled, between 0 and 1 inclusive
   * @param {Property.<boolean>} visibleProperty - whether the electron should be shown.
   * @constructor
   */
  function Electron( circuitElement, distance, visibleProperty ) {
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( distance >= 0, 'electron was below the origin of the circuit element' );
    assert && assert( circuitElement.containsScalarLocation( distance ), 'electron was not within the circuit element' );
    var self = this;

    this.circuitElement = circuitElement; // @public 
    this.radius = 0.1;
    this.deleted = false;

    this.distanceProperty = new Property( distance );
    this.updatingProperty = new Property( true ); // flag to disable updates during ElectronPropagator.step to improve performance
    this.positionProperty = new Property( new Vector2() );
    Property.preventGetSet( this, 'distance' );
    Property.preventGetSet( this, 'updating' );
    Property.preventGetSet( this, 'position' );

    var multilink = Property.multilink( [ this.distanceProperty, this.updatingProperty ], function( distance, updating ) {
      if ( updating ) {
        assert && assert( !self.deleted, 'Electron was deleted' );
        assert && assert( !isNaN( distance ), 'electron position was not a number' );
        var position = self.circuitElement.getPosition( distance );
        assert && assert( !isNaN( position.x ) && !isNaN( position.y ), 'point was not a number' );
        self.positionProperty.set( position );
      }
    } );

    // @public
    this.visibleProperty = visibleProperty;
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

    dispose: function() {
      this.disposeElectron();
    },

    setLocation: function( circuitElement, distance ) {
      assert && assert( !isNaN( distance ), 'Distance was NaN' );
      assert && assert( circuitElement.containsScalarLocation( distance ), 'no location in branch' );
      if ( this.circuitElement !== circuitElement ) {
        this.circuitElement = circuitElement;
      }
      this.distanceProperty.set( distance );
    }
  } );
} );