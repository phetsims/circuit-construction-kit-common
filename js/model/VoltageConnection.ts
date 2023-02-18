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
import CircuitElement from './CircuitElement.js';

export default class VoltageConnection {
  public readonly vertex: Vertex;
  public readonly voltage: number;
  public readonly circuitElement: CircuitElement | null;

  public constructor( vertex: Vertex, circuitElement: CircuitElement | null, voltage: number = vertex.voltageProperty.value ) {
    this.vertex = vertex;
    this.voltage = voltage;
    this.circuitElement = circuitElement;
  }

  public static VoltageConnectionIO = new IOType( 'VoltageConnectionIO', {
    valueType: VoltageConnection,
    documentation: 'In order to describe how a Voltmeter probe is connected to a circuit. It indicates the measured Vertex ' +
                   'or Circuit Element, and the voltage at that point. For non-ideal wires, the ' +
                   'voltage indicates the partial voltage dropped up to that point on the wire, like a potentiometer.',
    toStateObject: voltageConnection => ( {
      connection: ReferenceIO( IOType.ObjectIO ).toStateObject( voltageConnection.circuitElement || voltageConnection.vertex ),
      voltage: voltageConnection.voltage
    } ),
    fromStateObject: stateObject => {

      // Like in DerivedProperty, this is a no-op because the value is not used to restore the state
      // Will be recomputed after the model is restored. This code relies on the assumption that the VoltageConnectionIO
      // is contained in a NullableIO()
      return null;
    },
    stateSchema: {
      connection: ReferenceIO( IOType.ObjectIO ),
      voltage: NumberIO
    }
  } );
}

circuitConstructionKitCommon.register( 'VoltageConnection', VoltageConnection );