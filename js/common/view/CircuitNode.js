// Copyright 2015, University of Colorado Boulder

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
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/BatteryNode' );
  var LightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/LightBulbNode' );

  /**
   *
   * @constructor
   */
  function CircuitNode( circuit ) {
    Node.call( this );
    var circuitNode = this;

    var addWireNode = function( wire ) {
      circuitNode.addChild( new WireNode( circuit.getSnapContext(), wire ) );
    };
    circuit.wires.addItemAddedListener( addWireNode );
    circuit.wires.forEach( addWireNode );

    var addBatteryNode = function( battery ) {
      circuitNode.addChild( new BatteryNode( circuit.getSnapContext(), battery ) );
    };
    circuit.batteries.addItemAddedListener( addBatteryNode );
    circuit.batteries.forEach( addBatteryNode );

    var addLightBulbNode = function( lightBulb ) {
      circuitNode.addChild( new LightBulbNode( circuit.getSnapContext(), lightBulb ) );
    };
    circuit.lightBulbs.addItemAddedListener( addLightBulbNode );
    circuit.lightBulbs.forEach( addLightBulbNode );
  }

  return inherit( Node, CircuitNode );
} );