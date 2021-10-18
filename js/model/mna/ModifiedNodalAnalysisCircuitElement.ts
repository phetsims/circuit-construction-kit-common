// Copyright 2017-2021, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis.  The same type represents batteries and resistors--what matters
 * is what array they are placed into in the DynamicCircuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCUtils from '../../CCKCUtils.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitElement from '../CircuitElement.js';

class ModifiedNodalAnalysisCircuitElement {
  readonly nodeId0: string | number;
  readonly nodeId1: string | number;
  readonly circuitElement: CircuitElement | null;
  value: number;
  currentSolution: number | null;

  /**
   * @param {number|string} nodeId0
   * @param {number|string} nodeId1
   * @param {CircuitElement|null} circuitElement, null during qunit tests
   * @param {number} value - resistance for resistors, voltage for battery or current for current source
   * @param {number|null} [currentSolution]
   */
  constructor( nodeId0: string | number, nodeId1: string | number, circuitElement: CircuitElement | null, value: number, currentSolution: number | null = null ) {
    assert && CCKCUtils.validateNodeIndex( nodeId0 );
    assert && CCKCUtils.validateNodeIndex( nodeId1 );

    assert && assert( typeof value === 'number' );
    assert && assert( !isNaN( value ) );

    // @public (read-only) {number|string} index of the start node
    this.nodeId0 = nodeId0;

    // @public (read-only) {number|string} index of the end node
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
  withCurrentSolution( currentSolution: number ) {
    return new ModifiedNodalAnalysisCircuitElement( this.nodeId0, this.nodeId1, this.circuitElement, this.value, currentSolution );
  }

  /**
   * Determine if the element contains the given node id
   * @param {number} nodeId
   * @returns {boolean}
   * @private
   */
  containsNodeId( nodeId: string | number ) {
    return this.nodeId0 === nodeId || this.nodeId1 === nodeId;
  }

  /**
   * Find the node across from the specified node.
   * @param {number} nodeId
   * @private
   */
  getOppositeNode( nodeId: number | string ) {
    assert && assert( this.nodeId0 === nodeId || this.nodeId1 === nodeId );
    return this.nodeId0 === nodeId ? this.nodeId1 : this.nodeId0;
  }
}

circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisCircuitElement', ModifiedNodalAnalysisCircuitElement );
export default ModifiedNodalAnalysisCircuitElement;