// Copyright 2017, University of Colorado Boulder

/**
 * Circuit element used for Modified Nodal Analysis.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {number} nodeId0
   * @param {number} nodeId1
   * @param {CircuitElement} circuitElement
   * @param {number} value - resistance for resistors, voltage for battery or current for current source
   * @constructor
   */
  function ModifiedNodalAnalysisCircuitElement( nodeId0, nodeId1, circuitElement, value ) {
    assert && assert( typeof nodeId0 === 'number' );
    assert && assert( typeof nodeId1 === 'number' );
    assert && assert( typeof value === 'number' );

    this.nodeId0 = nodeId0;
    this.nodeId1 = nodeId1;
    this.circuitElement = circuitElement;
    this.value = value;

    this.currentSolution = null; // will be supplied by the modified nodal analysis
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