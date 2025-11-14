// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import DynamicCoreModel from './DynamicCoreModel.js';
export default class LTAInductor extends DynamicCoreModel {
  public readonly inductance: number;
  public inductorVoltageNode1: string | null;

  public constructor( id: number, node0: string, node1: string, voltage: number, current: number, inductance: number ) {
    super( id, node0, node1, voltage, current );

    affirm( !isNaN( inductance ), 'inductance cannot be NaN' );
    this.inductance = inductance;

    // Synthetic node to read the voltage different across the inductor part (since it is modeled in series with a resistor)
    this.inductorVoltageNode1 = null;
  }
}

circuitConstructionKitCommon.register( 'LTAInductor', LTAInductor );