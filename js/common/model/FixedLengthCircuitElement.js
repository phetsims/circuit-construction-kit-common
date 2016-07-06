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

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElement', FixedLengthCircuitElement );

  return inherit( CircuitElement, FixedLengthCircuitElement );
} );