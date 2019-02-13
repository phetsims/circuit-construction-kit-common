// Copyright 2015-2019, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length between vertices (unlike stretchy Wires).  This is
 * their common base class. Note that it is NOT fixed length (light bulb breaks this), but has fixed vertex positions
 * relative to the element's transform.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElement' );
  const Range = require( 'DOT/Range' );

  class FixedCircuitElement extends CircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {number} chargePathLength - the distance the charges travel (in view coordinates), see CircuitElement.js
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, chargePathLength, tandem, options ) {

      options = _.extend( {
        editableRange: new Range( 0, 120 ),
        editorDelta: 0.5
      }, options );

      // Super constructor
      super( startVertex, endVertex, chargePathLength, tandem, options );

      // @public (read-only) {Range} - the range of values the CircuitElement can take
      this.editableRange = options.editableRange;

      // @public (read-only) {number} - the tweaker value for the controls
      this.editorDelta = options.editorDelta;

      // @public (read-only) {number} The distance from one vertex to another (as the crow flies), used for rotation
      // about a vertex
      this.distanceBetweenVertices = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );

      // @public {boolean} keep track of whether it is a fixed length element for assertion testing in CircuitElement
      this.isFixedCircuitElement = true;
    }
  }

  return circuitConstructionKitCommon.register( 'FixedCircuitElement', FixedCircuitElement );
} );