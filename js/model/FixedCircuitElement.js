// Copyright 2015-2020, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length between vertices (unlike stretchy Wires).  This is
 * their common base class. Note that it is NOT fixed length (light bulb breaks this), but has fixed vertex positions
 * relative to the element's transform.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';

class FixedCircuitElement extends CircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} chargePathLength - the distance the charges travel (in view coordinates), see CircuitElement.js
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, chargePathLength, tandem, options ) {

    options = merge( {
      editableRange: new Range( 0, 120 ),
      numberOfDecimalPlaces: 1
    }, options );

    // Super constructor
    super( startVertex, endVertex, chargePathLength, tandem, options );

    // @public (read-only) {Range} - the range of values the CircuitElement can take
    this.editableRange = options.editableRange;

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = options.numberOfDecimalPlaces;

    // @public (read-only) {number} The distance from one vertex to another (as the crow flies), used for rotation
    // about a vertex
    this.distanceBetweenVertices = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );

    // @public {boolean} keep track of whether it is a fixed length element for assertion testing in CircuitElement
    this.isFixedCircuitElement = true;
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElement', FixedCircuitElement );
export default FixedCircuitElement;