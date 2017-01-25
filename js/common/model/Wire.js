// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Property = require( 'AXON/Property' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  /**
   *
   * @constructor
   */
  function Wire( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var self = this;
    var electronPathLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    CircuitElement.call( this, startVertex, endVertex, electronPathLength, options );

    // @public (read-only) - the resistance of the Wire in ohms
    this.resistanceProperty = new NumberProperty( CircuitConstructionKitConstants.MINIMUM_RESISTANCE );

    // @public (read-only) - the resistivity of the Wire in ohm-meters
    // TODO: when the resistivity changes, update the resistance
    this.resistivityProperty = new NumberProperty( resistivity );

    /**
     * When the vertex moves, updates the resistance and electron path length.
     */
    var vertexMovedListener = function() {
      var startPosition = self.startVertexProperty.get().positionProperty.get();
      var endPosition = self.endVertexProperty.get().positionProperty.get();
      var distanceBetweenVertices = startPosition.distance( endPosition );
      var javaLength = distanceBetweenVertices / 990 * 15.120675866835684;
      var resistance = javaLength * self.resistivityProperty.get();
      var newResistance = Math.max( CircuitConstructionKitConstants.MINIMUM_RESISTANCE, resistance );
      assert && assert( !isNaN( newResistance ), 'wire resistance should not be NaN' );
      self.resistanceProperty.set( newResistance );
      self.electronPathLength = distanceBetweenVertices;
    };

    // Use `self` here instead of `this` so IDEA doesn't mark the property as missing.
    self.vertexMovedEmitter.addListener( vertexMovedListener );

    // Update the resistance and electron path length on startup
    vertexMovedListener();

    this.disposeWire = function() {
      assert && assert( !self.disposed, 'Was already disposed' );
      self.disposed = true;
      self.vertexMovedEmitter.removeListener( vertexMovedListener );
    };
    this.disposed = false;
  }

  circuitConstructionKitCommon.register( 'Wire', Wire );

  return inherit( CircuitElement, Wire, {

    /**
     * Releases all resources related to the Wire, called when it will no longer be used.
     * @public
     */
    dispose: function() {
      CircuitElement.prototype.dispose.call( this );
      this.disposeWire();
    },

    /**
     * Returns an object with the state of the Wire, so that it can be saved/loaded.
     * @returns {Object}
     * @public
     */
    attributesToStateObject: function() {
      return {
        resistance: this.resistanceProperty.get(),
        resistivity: this.resistivityProperty.get()
      };
    }
  } );
} );