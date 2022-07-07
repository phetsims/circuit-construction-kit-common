// Copyright 2021-2022, University of Colorado Boulder

import MNACircuitElement from './MNACircuitElement.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';

export default class MNAResistor extends MNACircuitElement {
  public resistance: number;

  public constructor( nodeId0: string, nodeId1: string, resistance: number ) {
    super( nodeId0, nodeId1 );
    this.resistance = resistance;
  }
}

circuitConstructionKitCommon.register( 'MNAResistor', MNAResistor );