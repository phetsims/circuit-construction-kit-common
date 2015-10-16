// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/WireNode' );

  /**
   *
   * @constructor
   */
  function CircuitNode( circuit ) {
    Node.call( this );
    var circuitNode = this;
    var createWireNode = function( wire ) {
      circuitNode.addChild( new WireNode( circuit.getSnapContext(), wire ) );
    };
    circuit.wires.addItemAddedListener( createWireNode );
    circuit.wires.forEach( createWireNode );
  }

  return inherit( Node, CircuitNode );
} );