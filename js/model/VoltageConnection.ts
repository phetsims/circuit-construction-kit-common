// Copyright 2019-2021, University of Colorado Boulder

/**
 * Indicates a vertex and a voltage measurement at the given vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from './Vertex.js';

export default class VoltageConnection {
  readonly vertex: Vertex;
  readonly voltage: number;

  constructor( vertex: Vertex, voltage: number = vertex.voltageProperty.value ) {
    this.vertex = vertex;
    this.voltage = voltage;
  }
}

circuitConstructionKitCommon.register( 'VoltageConnection', VoltageConnection );