// Copyright 2015-2017, University of Colorado Boulder

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
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElement' );

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} distanceBetweenVertices - in screen coordinates
   * @param {number} chargePathLength - the distance the charges must travel (in screen coordinates).  More docs in CircuitElement.js
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function FixedLengthCircuitElement( startVertex, endVertex, distanceBetweenVertices, chargePathLength, tandem, options ) {

    // Check that the measured length matches the specified length
    var measuredLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    assert && assert( Math.abs( distanceBetweenVertices - measuredLength ) < 1E-6, 'length should be ' + distanceBetweenVertices );

    // Super constructor
    CircuitElement.call( this, startVertex, endVertex, chargePathLength, tandem, options );

    // @public (read-only) The distance from one vertex to another (as the crow flies), used for rotation about a vertex
    this.distanceBetweenVertices = distanceBetweenVertices;

    // @public - placeholder for ValueNode, assigned by the view and used so the ValueNode can be looked up from the FixedLengthCircuitElement
    this.valueNode = null;
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElement', FixedLengthCircuitElement );

  return inherit( CircuitElement, FixedLengthCircuitElement );
} );