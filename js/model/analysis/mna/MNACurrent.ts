// Copyright 2021, University of Colorado Boulder

import MNACircuitElement from './MNACircuitElement.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';

export default class MNACurrent extends MNACircuitElement {
  readonly current: number;

  constructor( nodeId0: string, nodeId1: string, current: number ) {
    super( nodeId0, nodeId1 );
    this.current = current;
  }
}
circuitConstructionKitCommon.register( 'MNACurrent', MNACurrent );