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
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );

  // constants
  var RESISTOR_LENGTH = 146 * 0.75;

  /**
   *
   * @constructor
   */
  function Resistor( startVertex, endVertex, resistance ) {
    var length = startVertex.position.distance( endVertex.position );
    assert && assert( Math.abs( length - RESISTOR_LENGTH ) < 1E-6, 'length should be ' + RESISTOR_LENGTH + ' or so' );

    FixedLengthCircuitElement.call( this, length, startVertex, endVertex, {
      resistance: resistance
    } );
  }

  return inherit( FixedLengthCircuitElement, Resistor, {
      toStateObjectWithVertexIndices: function( getVertexIndex ) {
        return _.extend( { resistance: this.resistance }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
      }
    }, {
      RESISTOR_LENGTH: RESISTOR_LENGTH
    }
  );
} );