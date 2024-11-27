// Copyright 2021-2024, University of Colorado Boulder

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNACircuitElement from './MNACircuitElement.js';

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class MNACurrent extends MNACircuitElement {
  public readonly current: number;

  public constructor( nodeId0: string, nodeId1: string, current: number ) {
    super( nodeId0, nodeId1 );
    this.current = current;
  }

  public override toString(): string {
    return super.toString() + `, current: ${this.current}`;
  }
}
circuitConstructionKitCommon.register( 'MNACurrent', MNACurrent );