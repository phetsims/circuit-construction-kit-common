// Copyright 2015-2017, University of Colorado Boulder

/**
 * A wire whose length can change.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NumberProperty = require( 'AXON/NumberProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );

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
    options = _.extend( { wireStub: false }, options );
    var self = this;
    var chargePathLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    CircuitElement.call( this, startVertex, endVertex, chargePathLength, tandem, options );

    // @public (read-only) {boolean} - if the wire is a small stub attached to the black box
    this.wireStub = options.wireStub;

    // @public {NumberProperty} - the resistance of the Wire in ohms
    this.resistanceProperty = new NumberProperty( CircuitConstructionKitCommonConstants.MINIMUM_RESISTANCE );

    // @public {Property.<number>} - the resistivity of the Wire in ohm-meters
    this.resistivityProperty = resistivityProperty;

    // @public {Property.<number>} - when the length changes the ChargeLayout must be run
    this.lengthProperty = new NumberProperty( 0 );

    // @private {boolean} - batch changes so that the length doesn't change incrementally when individual vertices move
    this.wireDirty = true;

    // When the vertex moves, updates the resistance and charge path length.
    var markWireDirty = function() {
      self.wireDirty = true;
    };

    // Use `self` here instead of `this` so IDEA doesn't mark the property as missing.
    self.vertexMovedEmitter.addListener( markWireDirty );

    // Update the resistance and charge path length on startup
    markWireDirty();

    // When resistivity changes, update the resistance
    this.resistivityProperty.link( markWireDirty );

    // @private {function} - for disposal
    //REVIEW: Again if memory is an issue (I'll investigate), having this as a method may be better.
    //REVIEW(samreid): My suspicion is that with a small number (<100) of wires, the overhead from these closures will
    //REVIEW(samreid): be in the noise
    this.disposeWire = function() {
      self.vertexMovedEmitter.removeListener( markWireDirty );
      self.resistivityProperty.unlink( markWireDirty );
    };

    this.step(); // initialize state
  }

  circuitConstructionKitCommon.register( 'Wire', Wire );

  return inherit( CircuitElement, Wire, {

    /**
     * Batch changes so that the length doesn't change incrementally when both vertices move one at a time.
     * @public
     * REVIEW: Would normally name this update(), since it has no DT and conditionally updates based on the dirty flag.
     */
    step: function() {
      if ( this.wireDirty ) {
        var self = this;
        //REVIEW: Another place where having a shortcut to the position properties (on the circuit element) would be nice.
        var startPosition = self.startVertexProperty.get().positionProperty.get();
        var endPosition = self.endVertexProperty.get().positionProperty.get();
        var viewLength = startPosition.distance( endPosition );
        var modelLength = viewLength * METERS_PER_VIEW_COORDINATE;
        self.lengthProperty.set( modelLength );
        var resistance = modelLength * self.resistivityProperty.get();
        var clampedResistance = Math.max( CircuitConstructionKitCommonConstants.MINIMUM_RESISTANCE, resistance );
        assert && assert( !isNaN( clampedResistance ), 'wire resistance should not be NaN' );
        self.resistanceProperty.set( clampedResistance );
        self.chargePathLength = viewLength;
        this.wireDirty = false;
      }
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
      this.disposeWire();
      CircuitElement.prototype.dispose.call( this );
    },

    /**
     * Returns an object with the state of the Wire, so that it can be saved/loaded.
     * @returns {Object}
     * @public
     * REVIEW: Duck typing looks good for these objects, but it should be documented where the spec is.
     * REVIEW(samreid): In discussion in Battery.js
     */
    attributesToStateObject: function() {
      return {
        resistance: this.resistanceProperty.get(),
        resistivity: this.resistivityProperty.get()
      };
    }
  } );
} );