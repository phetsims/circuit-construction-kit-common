// Copyright 2015-2021, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length between vertices (unlike stretchy Wires).  This is
 * their common base class. Note that it is NOT fixed length (light bulb breaks this), but has fixed vertex positions
 * relative to the element's transform.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement, { CircuitElementOptions } from './CircuitElement.js';
import Vertex from './Vertex.js';

type FixedCircuitElementOptions = {
  numberOfDecimalPlaces: number
} & CircuitElementOptions;

abstract class FixedCircuitElement extends CircuitElement {
  private readonly numberOfDecimalPlaces: number;
  private readonly distanceBetweenVertices: number;
  private readonly isFixedCircuitElement: boolean;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} chargePathLength - the distance the charges travel (in view coordinates), see CircuitElement.js
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, chargePathLength: number, tandem: Tandem, options?: Partial<FixedCircuitElementOptions> ) {

    const filledOptions = merge( {
      numberOfDecimalPlaces: 1
    }, options ) as FixedCircuitElementOptions;

    // Super constructor
    super( startVertex, endVertex, chargePathLength, tandem, filledOptions );

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = filledOptions.numberOfDecimalPlaces;

    // @public (read-only) {number} The distance from one vertex to another (as the crow flies), used for rotation
    // about a vertex
    this.distanceBetweenVertices = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );

    // @public {boolean} keep track of whether it is a fixed length element for assertion testing in CircuitElement
    this.isFixedCircuitElement = true;
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElement', FixedCircuitElement );
export { FixedCircuitElementOptions };
export default FixedCircuitElement;