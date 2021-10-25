// Copyright 2017-2021, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis.  The same type represents batteries and resistors--what matters
 * is what array they are placed into in the DynamicCircuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCUtils from '../../../CCKCUtils.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import CircuitElement from '../../CircuitElement.js';

class MNACircuitElement {
  readonly nodeId0: string;
  readonly nodeId1: string;
  readonly circuitElement: CircuitElement | null;
  currentSolution: number | null;

  /**
   * @param {string} nodeId0
   * @param {string} nodeId1
   * @param {CircuitElement|null} circuitElement, null during qunit tests
   * @param {number|null} [currentSolution]
   */
  constructor( nodeId0: string, nodeId1: string, circuitElement: CircuitElement | null, currentSolution: number | null = null ) {
    assert && CCKCUtils.validateNodeIndex( nodeId0 );
    assert && CCKCUtils.validateNodeIndex( nodeId1 );

    // @public (read-only) {string} index of the start node
    this.nodeId0 = nodeId0;

    // @public (read-only) {string} index of the end node
    this.nodeId1 = nodeId1;

    // @public (read-only) {CircuitElement|null} index of the start node
    this.circuitElement = circuitElement;

    // @public {number} supplied by the modified nodal analysis
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
    return new MNACircuitElement( this.nodeId0, this.nodeId1, this.circuitElement, currentSolution );
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