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
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );

  // constants
  var DISTANCE_BETWEEN_VERTICES = 33;

  /**
   *
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance ) {
    FixedLengthCircuitElement.call( this, DISTANCE_BETWEEN_VERTICES, startVertex, endVertex, {
      resistance: resistance
    } );
  }

  return inherit( FixedLengthCircuitElement, LightBulb, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( { resistance: this.resistance }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  }, {
    DISTANCE_BETWEEN_VERTICES: DISTANCE_BETWEEN_VERTICES
  } );
} );