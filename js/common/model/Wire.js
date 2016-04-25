// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/CircuitElement' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   *
   * @constructor
   */
  function Wire( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var wire = this;
    CircuitElement.call( this, startVertex, endVertex, {
      resistance: CircuitConstructionKitBasicsConstants.minimumResistance,
      resistivity: resistivity
    }, options );

    var updateResistance = function() {
      var length = wire.startVertex.position.minus( wire.endVertex.position ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      wire.resistance = Math.max( CircuitConstructionKitBasicsConstants.minimumResistance, javaLength * wire.resistivity );
      assert && assert( !isNaN( wire.resistance ) );
    };

    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( updateResistance );
      newStartVertex.positionProperty.link( updateResistance );
    };
    this.startVertexProperty.link( updateStartVertex );

    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( updateResistance );
      newEndVertex.positionProperty.link( updateResistance );
    };
    this.endVertexProperty.link( updateEndVertex );

    this.disposeWire = function() {
      wire.startVertex.unlink( updateResistance );
      wire.endVertex.unlink( updateResistance );
    };
  }

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