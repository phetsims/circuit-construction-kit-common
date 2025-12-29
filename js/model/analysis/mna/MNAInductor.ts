// Copyright 2025, University of Colorado Boulder

/**
 * Inductor element for SPICE-based circuit analysis.
 * Includes inductance and initial current state for transient analysis.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNACircuitElement from './MNACircuitElement.js';

export default class MNAInductor extends MNACircuitElement {
  public readonly inductance: number;
  public readonly initialCurrent: number;

  public constructor( nodeId0: string, nodeId1: string, inductance: number, initialCurrent: number ) {
    super( nodeId0, nodeId1 );
    this.inductance = inductance;
    this.initialCurrent = initialCurrent;
  }
}

circuitConstructionKitCommon.register( 'MNAInductor', MNAInductor );
