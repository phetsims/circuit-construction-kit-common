// Copyright 2017, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis. * No listeners are attached and hence no dispose implementation is necessary.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {number} nodeId0
   * @param {number} nodeId1
   * @param {CircuitElement|null} circuitElement, null during qunit tests
   * @param {number} value - resistance for resistors, voltage for battery or current for current source
   * @constructor
   */
  function ModifiedNodalAnalysisCircuitElement( nodeId0, nodeId1, circuitElement, value ) {
    assert && assert( typeof nodeId0 === 'number' );
    assert && assert( typeof nodeId1 === 'number' );
    assert && assert( typeof value === 'number' );

    // @public (read-only) {number} index of the start node
    this.nodeId0 = nodeId0;

    // @public (read-only) {number} index of the end node
    this.nodeId1 = nodeId1;

    // @public (read-only) {CircuitElement|null} index of the start node
    this.circuitElement = circuitElement;

    // @public (read-only) {number} resistance for resistors, voltage for battery or current for current source
    this.value = value;

    // @public {number} supplied by the modified nodal analysis
    this.currentSolution = null;
  }

  circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisCircuitElement', ModifiedNodalAnalysisCircuitElement );

  inherit( Object, ModifiedNodalAnalysisCircuitElement, {

    /**
     * Determine if the element contains the given node id
     * @param {Element} element
     * @param {number} node
     * @returns {boolean}
     */
    containsNodeId: function( nodeId ) {
      return this.nodeId0 === nodeId || this.nodeId1 === nodeId;
    },

    /**
     * Find the node across from the specified node.
     * @param {Element} element
     * @param {number} node
     */
    getOppositeNode: function( nodeId ) {
      assert && assert( this.nodeId0 === nodeId || this.nodeId1 === nodeId );
      return this.nodeId0 === nodeId ? this.nodeId1 : this.nodeId0;
    }
  } );

  return ModifiedNodalAnalysisCircuitElement;
} );