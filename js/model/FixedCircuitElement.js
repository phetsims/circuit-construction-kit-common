// Copyright 2015-2017, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length between vertices (unlike stretchy Wires).  This is
 * their common base class. Note that it is NOT fixed length (light bulb breaks this), but has fixed vertex positions
 * relative to the element's transform.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElement' );
  var Range = require( 'DOT/Range' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} distanceBetweenVertices - in screen coordinates
   * @param {number} chargePathLength - the distance the charges travel (in view coordinates), see CircuitElement.js
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function FixedCircuitElement( startVertex, endVertex, distanceBetweenVertices, chargePathLength, tandem, options ) {
    //REVIEW*: Recommend getting rid of distanceBetweenVertices, compute it from startVertex/endVertex.

    options = _.extend( {
      editableRange: new Range( 0, 120 ),
      editorDelta: 0.5
    }, options );

    // @public (read-only) {Range} - the range of values the CircuitElement can take
    this.editableRange = options.editableRange;

    // @public (read-only) {number} - the tweaker value for the controls
    this.editorDelta = options.editorDelta;

    // Check that the measured length matches the specified length
    var measuredLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    assert && assert( Math.abs( distanceBetweenVertices - measuredLength ) < 1E-6, 'length should be ' +
                                                                                   distanceBetweenVertices );

    // Super constructor
    CircuitElement.call( this, startVertex, endVertex, chargePathLength, tandem, options );

    // @public (read-only) {number} The distance from one vertex to another (as the crow flies), used for rotation
    // about a vertex
    this.distanceBetweenVertices = distanceBetweenVertices;
  }

  circuitConstructionKitCommon.register( 'FixedCircuitElement', FixedCircuitElement );

  return inherit( CircuitElement, FixedCircuitElement );
} );