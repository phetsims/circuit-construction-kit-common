// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNACircuitElement from './MNACircuitElement.js';
export default class MNAResistor extends MNACircuitElement {
  public resistance: number;

  public constructor( nodeId0: string, nodeId1: string, resistance: number ) {
    super( nodeId0, nodeId1 );
    this.resistance = resistance;
  }
}

circuitConstructionKitCommon.register( 'MNAResistor', MNAResistor );