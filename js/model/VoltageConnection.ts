// Copyright 2019-2023, University of Colorado Boulder

/**
 * Indicates a vertex and a voltage measurement at the given vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from './Vertex.js';

const VertexReferenceIO = ReferenceIO( Vertex.VertexIO );
export default class VoltageConnection {
  public readonly vertex: Vertex;
  public readonly voltage: number;

  public constructor( vertex: Vertex, voltage: number = vertex.voltageProperty.value ) {
    this.vertex = vertex;
    this.voltage = voltage;
  }

  public static VoltageConnectionIO = new IOType( 'VoltageConnectionIO', {
    valueType: VoltageConnection,
    documentation: 'In order to describe how a Voltmeter probe is connected to a circuit. It indicates an adjacent vertex, and the voltage at the vertex. For non-ideal wires, the ' +
                   'voltage indicates the partial voltage dropped up to that point on the wire, like a potentiometer.',
    toStateObject: voltageConnection => ( {
      vertex: VertexReferenceIO.toStateObject( voltageConnection.vertex ),
      voltage: voltageConnection.voltage
    } ),
    stateSchema: {
      vertex: VertexReferenceIO,
      voltage: NumberIO
    }
  } );
}

circuitConstructionKitCommon.register( 'VoltageConnection', VoltageConnection );