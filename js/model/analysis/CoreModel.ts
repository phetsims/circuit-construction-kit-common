// Copyright 2021, University of Colorado Boulder

/**
 * Something with a companion model.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
class CoreModel {
  readonly node0: string;
  readonly node1: string;
  readonly id: number; // for equality testing

  constructor( id: number, node0: string, node1: string ) {
    this.id = id;
    this.node0 = node0;
    this.node1 = node1;
  }
}

export default CoreModel;