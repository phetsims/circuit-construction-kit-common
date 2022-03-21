// Copyright 2021, University of Colorado Boulder

import CoreModel from './CoreModel.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

/**
 * For capacitors and inductors, includes the voltage and current from prior calculation,
 * since they feed into the next calculation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class DynamicCoreModel extends CoreModel {
  readonly voltage: number; // the voltage drop v1-v0
  readonly current: number; // the conventional current as it moves from node 0 to node 1

  constructor( id: number, node0: string, node1: string, voltage: number, current: number ) {
    super( id, node0, node1 );
    this.voltage = voltage;
    this.current = current;
  }
}

circuitConstructionKitCommon.register( 'DynamicCoreModel', DynamicCoreModel );