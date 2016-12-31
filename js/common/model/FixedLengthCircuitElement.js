// Copyright 2015-2016, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length (unlike stretchy Wires).  This is their common
 * base class.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitElement' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {number} circuitElementLength - in screen coordinates
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Object} [options]
   * @constructor
   */
  function FixedLengthCircuitElement( circuitElementLength, startVertex, endVertex, options ) {

    // Check that the measured length matches the specified length
    var measuredLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    assert && assert( Math.abs( circuitElementLength - measuredLength ) < 1E-6, 'length should be ' + circuitElementLength );

    // Super constructor
    CircuitElement.call( this, startVertex, endVertex, options );

    Property.preventGetSet( this, 'length' );

    // @public (read-only) The distance from one vertex to another (as the crow flies), used for rotation about a vertex
    this.distanceBetweenVertices = circuitElementLength;

    // The distance electrons travel (along paths)
    this.circuitElementLength = circuitElementLength;
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElement', FixedLengthCircuitElement );

  return inherit( CircuitElement, FixedLengthCircuitElement );
} );