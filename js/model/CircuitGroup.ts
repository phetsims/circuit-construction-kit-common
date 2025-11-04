// Copyright 2025, University of Colorado Boulder

/**
 * For description, a grouping of circuit elements and vertices.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CircuitElement from './CircuitElement.js';
import Vertex from './Vertex.js';

type CircuitGroup = {
  circuitElements: CircuitElement[];
  vertices: Vertex[];
};

export default CircuitGroup;