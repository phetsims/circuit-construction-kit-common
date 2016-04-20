// Copyright 2015-2016, University of Colorado Boulder

/**
 * Abstract base class for CircuitElementNode and FixedLengthCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementNode( circuitElement, options ) {
    Node.call( this, options );
    this.circuitElement = circuitElement;
  }

  return inherit( Node, CircuitElementNode, {} );
} );