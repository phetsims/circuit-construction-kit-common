// Copyright 2019-2022, University of Colorado Boulder

/**
 * Indicates a circuitElement and a current measurement at the given circuitElement.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';

const CircuitElementReferenceIO = ReferenceIO( CircuitElement.CircuitElementIO );
export default class AmmeterConnection {
  public readonly circuitElement: CircuitElement;
  public readonly current: number;

  public constructor( circuitElement: CircuitElement, current: number = circuitElement.currentProperty.value ) {
    this.circuitElement = circuitElement;
    this.current = current;
  }

  public static VoltageConnectionIO = new IOType( 'VoltageConnectionIO', {
    valueType: AmmeterConnection,
    documentation: 'In order to describe how a Voltmeter probe is connected to a circuit. It indicates an adjacent circuitElement, and the current at the circuitElement. For non-ideal wires, the ' +
                   'current indicates the partial current dropped up to that point on the wire, like a potentiometer.',
    toStateObject: currentConnection => ( {
      circuitElement: CircuitElementReferenceIO.toStateObject( currentConnection.circuitElement ),
      current: currentConnection.current
    } ),
    stateSchema: {
      circuitElement: CircuitElementReferenceIO,
      current: NumberIO
    }
  } );
}

circuitConstructionKitCommon.register( 'AmmeterConnection', AmmeterConnection );