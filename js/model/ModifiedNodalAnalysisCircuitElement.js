// Copyright 2017-2019, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis.  The same type represents batteries and resistors--what matters
 * is what array they are placed into in the DynamicCircuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class ModifiedNodalAnalysisCircuitElement {

  /**
   * @param {number} nodeId0
   * @param {number} nodeId1
   * @param {CircuitElement|null} circuitElement, null during qunit tests
   * @param {number} value - resistance for resistors, voltage for battery or current for current source
   * @param {number|null} currentSolution
   */
  constructor( nodeId0, nodeId1, circuitElement, value, currentSolution = null ) {
    assert && assert( typeof nodeId0 === 'number' );
    assert && assert( typeof nodeId1 === 'number' );
    assert && assert( typeof value === 'number' );

    assert && assert( !isNaN( nodeId0 ) );
    assert && assert( !isNaN( nodeId1 ) );
    assert && assert( !isNaN( value ) );

    // @public (read-only) {number} index of the start node
    this.nodeId0 = nodeId0;

    // @public (read-only) {number} index of the end node
    this.nodeId1 = nodeId1;

    // @public (read-only) {CircuitElement|null} index of the start node
    this.circuitElement = circuitElement;

    // @public (read-only) {number} resistance for resistors, voltage for battery or current for current source
    this.value = value;

    // @public {number} supplied by the modified nodal analysis
    this.currentSolution = currentSolution;
  }

  /**
   * Creates a new instance matching this one but with a newly specified currentSolution.
   * Used in unit testing.
   * @param {number} currentSolution
   * @returns {ModifiedNodalAnalysisCircuitElement}
   * @public (unit-tests)
   */
  withCurrentSolution( currentSolution ) {
    return new ModifiedNodalAnalysisCircuitElement( this.nodeId0, this.nodeId1, this.circuitElement, this.value, currentSolution );
  }

  /**
   * Determine if the element contains the given node id
   * @param {number} nodeId
   * @returns {boolean}
   */
  containsNodeId( nodeId ) {
    return this.nodeId0 === nodeId || this.nodeId1 === nodeId;
  }

  /**
   * Find the node across from the specified node.
   * @param {number} nodeId
   */
  getOppositeNode( nodeId ) {
    assert && assert( this.nodeId0 === nodeId || this.nodeId1 === nodeId );
    return this.nodeId0 === nodeId ? this.nodeId1 : this.nodeId0;
  }
}

circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisCircuitElement', ModifiedNodalAnalysisCircuitElement );
export default ModifiedNodalAnalysisCircuitElement;