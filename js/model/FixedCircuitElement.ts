// Copyright 2015-2022, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length between vertices (unlike stretchy Wires).  This is
 * their common base class. Note that it is NOT fixed length (light bulb breaks this), but has fixed vertex positions
 * relative to the element's transform.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement, { CircuitElementOptions } from './CircuitElement.js';
import Vertex from './Vertex.js';

type FixedCircuitElementSelfOptions = {
  numberOfDecimalPlaces?: number;
};
type FixedCircuitElementOptions = FixedCircuitElementSelfOptions & CircuitElementOptions;

export default abstract class FixedCircuitElement extends CircuitElement {
  readonly numberOfDecimalPlaces: number;
  readonly distanceBetweenVertices: number;
  private readonly isFixedCircuitElement: boolean;

  constructor( startVertex: Vertex,
               endVertex: Vertex,
               chargePathLength: number, // the distance the charges travel (in view coordinates), see CircuitElement.js
               tandem: Tandem,
               providedOptions?: FixedCircuitElementOptions ) {

    const options = optionize<FixedCircuitElementOptions, FixedCircuitElementSelfOptions, CircuitElementOptions>( {
      numberOfDecimalPlaces: 1
    }, providedOptions );

    // Super constructor
    super( startVertex, endVertex, chargePathLength, tandem, options );

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
export type { FixedCircuitElementOptions };