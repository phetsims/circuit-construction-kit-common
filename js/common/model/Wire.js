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

  /**
   *
   * @constructor
   */
  function Wire( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var self = this;
    CircuitElement.call( this, startVertex, endVertex, {
      resistance: CircuitConstructionKitConstants.minimumResistance,
      resistivity: resistivity
    }, options );

    var updateResistance = function() {
      var length = self.startVertex.position.minus( self.endVertex.position ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      self.resistance = Math.max( CircuitConstructionKitConstants.minimumResistance, javaLength * self.resistivity );
      assert && assert( !isNaN( self.resistance ) );
    };

    this.disposeWire = function() {
      this.vertexMovedEmitter.removeListener( vertexMovedListener );
    };

    var updateLength = function() {
      self.length = self.startVertex.position.distance( self.endVertex.position );
    };

    var vertexMovedListener = function() {
      updateResistance();
      updateLength();
    };
    this.vertexMovedEmitter.addListener( vertexMovedListener );
    vertexMovedListener();
  }

  circuitConstructionKitCommon.register( 'Wire', Wire );

  return inherit( CircuitElement, Wire, {
    dispose: function() {
      this.disposeWire();
      CircuitElement.prototype.dispose.call( this );
    },
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( {
        resistance: this.resistance,
        resistivity: this.resistivity
      }, CircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  } );
} );