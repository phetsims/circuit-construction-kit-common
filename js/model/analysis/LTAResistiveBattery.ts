// Copyright 2021-2025, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CoreModel from './CoreModel.js';
class LTAResistiveBattery extends CoreModel {
  public readonly voltage: number;
  public resistance: number;

  public constructor( id: number, node0: string, node1: string, voltage: number, resistance: number ) {
    super( id, node0, node1 );
    this.voltage = voltage;
    this.resistance = resistance;
  }
}

circuitConstructionKitCommon.register( 'LTAResistiveBattery', LTAResistiveBattery );
export default LTAResistiveBattery;