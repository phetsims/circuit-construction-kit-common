// Copyright 2021-2022, University of Colorado Boulder

import MNACircuitElement from './MNACircuitElement.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';

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