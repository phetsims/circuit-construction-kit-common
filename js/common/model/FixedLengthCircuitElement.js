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
    CircuitElement.call( this, startVertex, endVertex, propertySetMap );
    this.length = length;

    // TODO: Derived properties for startPosition and endPosition, to encapsulate the
    // TODO: matter of switching vertices.
  }

  return inherit( CircuitElement, FixedLengthCircuitElement );
} );