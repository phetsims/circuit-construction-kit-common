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
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );

  /**
   *
   * @constructor
   */
  function Wire( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var wire = this;
    CircuitElement.call( this, startVertex, endVertex, {
      resistance: CircuitConstructionKitConstants.minimumResistance,
      resistivity: resistivity
    }, options );

    var updateResistance = function() {
      var length = wire.startVertex.position.minus( wire.endVertex.position ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      wire.resistance = Math.max( CircuitConstructionKitConstants.minimumResistance, javaLength * wire.resistivity );
      assert && assert( !isNaN( wire.resistance ) );
    };

    this.disposeWire = function() {
      this.vertexMovedEmitter.removeListener( vertexMovedListener );
    };

    var updateLength = function() {
      wire.length = wire.startVertex.position.distance( wire.endVertex.position );
    };

    var vertexMovedListener = function() {
      updateResistance();
      updateLength();
    };
    this.vertexMovedEmitter.addListener( vertexMovedListener );
    vertexMovedListener();
  }

  circuitConstructionKit.register( 'Wire', Wire );

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