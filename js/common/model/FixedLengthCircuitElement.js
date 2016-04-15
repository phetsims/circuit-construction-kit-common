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
  function FixedLengthCircuitElement( length, startVertex, endVertex, propertySetMap ) {
    var actualLength = startVertex.position.distance( endVertex.position );
    assert && assert( Math.abs( length - actualLength ) < 1E-6, 'length should be ' + length );

    CircuitElement.call( this, startVertex, endVertex, propertySetMap );
    this.length = length;
  }

  return inherit( CircuitElement, FixedLengthCircuitElement );
} );