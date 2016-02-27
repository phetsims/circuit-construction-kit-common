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
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ResistorNode' );
  var ConnectionNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ConnectionNode' );

  /**
   *
   * @constructor
   */
  function CircuitNode( circuit ) {
    Node.call( this );
    var circuitNode = this;

    this.batteryNodes = [];
    this.lightBulbNodes = [];
    this.wireNodes = [];
    this.resistorNodes = [];

    var addWireNode = function( wire ) {
      var wireNode = new WireNode( circuit.getSnapContext(), wire );
      circuitNode.wireNodes.push( wireNode );
      circuitNode.addChild( wireNode );
    };
    circuit.wires.addItemAddedListener( addWireNode );
    circuit.wires.forEach( addWireNode );

    var addBatteryNode = function( battery ) {
      var batteryNode = new BatteryNode( circuit.getSnapContext(), battery );
      circuitNode.batteryNodes.push( batteryNode );
      circuitNode.addChild( batteryNode );
    };
    circuit.batteries.addItemAddedListener( addBatteryNode );
    circuit.batteries.forEach( addBatteryNode );

    var addLightBulbNode = function( lightBulb ) {
      var lightBulbNode = new LightBulbNode( circuit.getSnapContext(), lightBulb );
      circuitNode.lightBulbNodes.push( lightBulbNode );
      circuitNode.addChild( lightBulbNode );
    };
    circuit.lightBulbs.addItemAddedListener( addLightBulbNode );
    circuit.lightBulbs.forEach( addLightBulbNode );

    var addResistorNode = function( resistor ) {
      var resistorNode = new ResistorNode( circuit.getSnapContext(), resistor );
      circuitNode.resistorNodes.push( resistorNode );
      circuitNode.addChild( resistorNode );
    };
    circuit.resistors.addItemAddedListener( addResistorNode );
    circuit.resistors.forEach( addResistorNode );

    var addConnectionNode = function( connection ) {
      var connectionNode = new ConnectionNode( circuit.getSnapContext(), connection );
      circuitNode.addChild( connectionNode );
    };
    circuit.connections.addItemAddedListener( addConnectionNode );
    circuit.connections.forEach( addConnectionNode );
  }

  return inherit( Node, CircuitNode );
} );