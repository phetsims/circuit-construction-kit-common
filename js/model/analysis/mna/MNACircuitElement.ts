// Copyright 2017-2021, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis.  The same type represents batteries and resistors--what matters
 * is what array they are placed into in the LTACircuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCUtils from '../../../CCKCUtils.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';

class MNACircuitElement {
  readonly nodeId0: string; // index of the start node
  readonly nodeId1: string; // index of the end node
  currentSolution: number | null; // supplied by the modified nodal analysis

  constructor( nodeId0: string, nodeId1: string, currentSolution: number | null = null ) {
    assert && CCKCUtils.validateNodeIndex( nodeId0 );
    assert && CCKCUtils.validateNodeIndex( nodeId1 );

    this.nodeId0 = nodeId0;
    this.nodeId1 = nodeId1;
    this.currentSolution = currentSolution;
  }

  /**
   * Creates a new instance matching this one but with a newly specified currentSolution.
   * Used in unit testing.
   * @param {number} currentSolution
   * @returns {MNACircuitElement}
   * @public (unit-tests)
   */
  withCurrentSolution( currentSolution: number ) {
    return new MNACircuitElement( this.nodeId0, this.nodeId1, currentSolution );
  }

  /**
   * Determine if the element contains the given node id
   * @param {string} nodeId
   * @returns {boolean}
   * @private
   */
  containsNodeId( nodeId: string ) {
    return this.nodeId0 === nodeId || this.nodeId1 === nodeId;
  }

  /**
   * Find the node across from the specified node.
   * @param {string} nodeId
   * @private
   */
  getOppositeNode( nodeId: string ) {
    assert && assert( this.nodeId0 === nodeId || this.nodeId1 === nodeId );
    return this.nodeId0 === nodeId ? this.nodeId1 : this.nodeId0;
  }
}

circuitConstructionKitCommon.register( 'MNACircuitElement', MNACircuitElement );
export default MNACircuitElement;