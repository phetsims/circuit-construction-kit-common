// Copyright 2015-2016, University of Colorado Boulder

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

  /**
   *
   * @constructor
   */
  function FixedLengthCircuitElement( length, startVertex, endVertex, additionalProperties, options ) {
    var actualLength = startVertex.position.distance( endVertex.position );
    assert && assert( Math.abs( length - actualLength ) < 1E-6, 'length should be ' + length );

    CircuitElement.call( this, startVertex, endVertex, additionalProperties, options );
    this.length = length;
  }

  circuitConstructionKit.register( 'FixedLengthCircuitElement', FixedLengthCircuitElement );
  
  return inherit( CircuitElement, FixedLengthCircuitElement );
} );