// Copyright 2021-2022, University of Colorado Boulder

import CoreModel from './CoreModel.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

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