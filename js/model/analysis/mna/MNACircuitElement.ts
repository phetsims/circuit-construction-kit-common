// Copyright 2017-2022, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis.  The same type represents batteries and resistors--what matters
 * is what array they are placed into in the LTACircuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';

export default class MNACircuitElement {
  public readonly nodeId0: string; // index of the start node
  public readonly nodeId1: string; // index of the end node

  public constructor( nodeId0: string, nodeId1: string ) {
    this.nodeId0 = nodeId0;
    this.nodeId1 = nodeId1;
  }

  /**
   * Determine if the element contains the given node id
   */
  public containsNodeId( nodeId: string ): boolean {
    return this.nodeId0 === nodeId || this.nodeId1 === nodeId;
  }

  /**
   * Find the node across from the specified node.
   */
  public getOppositeNode( nodeId: string ): string {
    assert && assert( this.nodeId0 === nodeId || this.nodeId1 === nodeId );
    return this.nodeId0 === nodeId ? this.nodeId1 : this.nodeId0;
  }

  public toString(): string {
    return `${this.nodeId0}, ${this.nodeId1}`;
  }
}

circuitConstructionKitCommon.register( 'MNACircuitElement', MNACircuitElement );