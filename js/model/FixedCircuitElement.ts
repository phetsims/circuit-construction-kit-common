// Copyright 2015-2025, University of Colorado Boulder

/**
 * CircuitElements such as Resistor, Battery, etc have a fixed length between vertices (unlike stretchy Wires).  This is
 * their common base class. Note that it is NOT fixed length (light bulb breaks this), but has fixed vertex positions
 * relative to the element's transform.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement, { type CircuitElementOptions } from './CircuitElement.js';
import type CircuitElementType from './CircuitElementType.js';
import type Vertex from './Vertex.js';

type SelfOptions = {
  numberOfDecimalPlaces?: number;
};
export type FixedCircuitElementOptions = SelfOptions & CircuitElementOptions;

export default abstract class FixedCircuitElement extends CircuitElement {

  // the number of decimal places to show in readouts and controls
  public readonly numberOfDecimalPlaces: number;

  // The distance from one vertex to another (as the crow flies), used for rotation about a vertex
  public readonly distanceBetweenVertices: number;

  // keep track of whether it is a fixed length element for assertion testing in CircuitElement
  private readonly isFixedCircuitElement: boolean;

  public constructor( type: CircuitElementType,
                      startVertex: Vertex,
                      endVertex: Vertex,
                      chargePathLength: number, // the distance the charges travel (in view coordinates), see CircuitElement.js
                      tandem: Tandem,
                      providedOptions?: FixedCircuitElementOptions ) {

    const options = optionize<FixedCircuitElementOptions, SelfOptions, CircuitElementOptions>()( {
      numberOfDecimalPlaces: 1
    }, providedOptions );

    // Super constructor
    super( type, startVertex, endVertex, chargePathLength, tandem, options );

    this.numberOfDecimalPlaces = options.numberOfDecimalPlaces;
    this.distanceBetweenVertices = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    this.isFixedCircuitElement = true;
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElement', FixedCircuitElement );