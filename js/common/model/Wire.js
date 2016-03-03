// Copyright 2015, University of Colorado Boulder

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

  /**
   *
   * @constructor
   */
  function Wire( startVertex, endVertex, resistance ) {
    CircuitElement.call( this, startVertex, endVertex, {
      resistance: resistance
    } );
  }

  return inherit( CircuitElement, Wire, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( { resistance: this.resistance }, CircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  } );
} );