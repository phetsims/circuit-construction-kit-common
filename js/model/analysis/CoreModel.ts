// Copyright 2021-2022, University of Colorado Boulder

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

/**
 * Something with a companion model.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export default class CoreModel {
  public readonly node0: string;
  public readonly node1: string;
  public readonly id: number; // for equality testing

  public constructor( id: number, node0: string, node1: string ) {
    this.id = id;
    this.node0 = node0;
    this.node1 = node1;
  }
}
circuitConstructionKitCommon.register( 'CoreModel', CoreModel );