// Copyright 2019-2022, University of Colorado Boulder

/**
 * Indicates a vertex and a voltage measurement at the given vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from './Vertex.js';

export default class VoltageConnection {
  public readonly vertex: Vertex;
  public readonly voltage: number;

  public constructor( vertex: Vertex, voltage: number = vertex.voltageProperty.value ) {
    this.vertex = vertex;
    this.voltage = voltage;
  }
}

circuitConstructionKitCommon.register( 'VoltageConnection', VoltageConnection );