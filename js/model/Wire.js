// Copyright 2015-2017, University of Colorado Boulder

/**
 * A wire whose length can change.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  // Conversion factor between model=view coordinates and meters, in order to use resistivity to compute resistance.
  var METERS_PER_VIEW_COORDINATE = 0.015273409966500692;

  /**
   * Wire main constructor
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Property.<number>} resistivityProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Wire( startVertex, endVertex, resistivityProperty, tandem, options ) {
    assert && assert( typeof resistivityProperty !== 'number', 'property should not be a number' );
    options = _.extend( { wireStub: false, isMetallic: true }, options );
    var chargePathLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    CircuitElement.call( this, startVertex, endVertex, chargePathLength, tandem, options );

    // @public (read-only) {boolean} - if the wire is a small stub attached to the black box
    this.wireStub = options.wireStub;

    // @public {NumberProperty} - the resistance of the Wire in ohms
    this.resistanceProperty = new NumberProperty( CCKCConstants.MINIMUM_RESISTANCE );

    // @public {Property.<number>} - the resistivity of the Wire in ohm-meters
    this.resistivityProperty = resistivityProperty;

    // @public {Property.<number>} - when the length changes layoutCharges must be called
    this.lengthProperty = new NumberProperty( 0 );

    // @private {boolean} - batch changes so that the length doesn't change incrementally when individual vertices move
    this.wireDirty = true;

    // When the vertex moves, updates the resistance and charge path length.
    this.markWireDirtyListener = this.markWireDirty.bind( this );

    this.vertexMovedEmitter.addListener( this.markWireDirtyListener );

    // When resistivity changes, update the resistance
    this.resistivityProperty.link( this.markWireDirtyListener );

    this.update(); // initialize state
  }

  circuitConstructionKitCommon.register( 'Wire', Wire );

  return inherit( CircuitElement, Wire, {

    /**
     * Batch changes so that the length doesn't change incrementally when both vertices move one at a time.
     * @public
     */
    update: function() {
      if ( this.wireDirty ) {
        var startPosition = this.startPositionProperty.get();
        var endPosition = this.endPositionProperty.get();
        var viewLength = startPosition.distance( endPosition );
        var modelLength = viewLength * METERS_PER_VIEW_COORDINATE;
        this.lengthProperty.set( modelLength );
        var resistance = modelLength * this.resistivityProperty.get();
        var clampedResistance = Math.max( CCKCConstants.MINIMUM_RESISTANCE, resistance );
        assert && assert( !isNaN( clampedResistance ), 'wire resistance should not be NaN' );
        this.resistanceProperty.set( clampedResistance );

        // Update the charge path length, but don't let it go less than a threshold, see https://github.com/phetsims/circuit-construction-kit-common/issues/405
        this.chargePathLength = Math.max( viewLength, 1E-6 );
        this.wireDirty = false;
      }
    },

    /**
     * @private - mark the wire as needing to have its geometry and resistance updated
     */
    markWireDirty: function() {
      this.wireDirty = true;
    },

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.resistanceProperty ];
    },

    /**
     * Releases all resources related to the Wire, called when it will no longer be used.
     * @public
     * @override
     */
    dispose: function() {
      this.vertexMovedEmitter.removeListener( this.markWireDirtyListener );
      this.resistivityProperty.unlink( this.markWireDirtyListener );
      CircuitElement.prototype.dispose.call( this );
    }
  } );
} );