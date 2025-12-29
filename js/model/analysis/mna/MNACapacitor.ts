// Copyright 2025, University of Colorado Boulder

/**
 * Capacitor element for SPICE-based circuit analysis.
 * Includes capacitance and initial voltage state for transient analysis.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNACircuitElement from './MNACircuitElement.js';

export default class MNACapacitor extends MNACircuitElement {
  public readonly capacitance: number;
  public readonly initialVoltage: number;

  public constructor( nodeId0: string, nodeId1: string, capacitance: number, initialVoltage: number ) {
    super( nodeId0, nodeId1 );
    this.capacitance = capacitance;
    this.initialVoltage = initialVoltage;
  }
}

circuitConstructionKitCommon.register( 'MNACapacitor', MNACapacitor );
