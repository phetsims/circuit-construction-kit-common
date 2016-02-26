// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );

  // images
  var voltmeterBody = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/voltmeter_body.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_red.png' );
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_black.png' );

  function VoltmeterNode() {
    var redProbeNode = new Image( redProbe, { scale: 0.67 } );
    var blackProbeNode = new Image( blackProbe, { scale: 0.67 } );
    var voltmeterBodyNode = new Image( voltmeterBody );
    voltmeterBodyNode.left = redProbeNode.right + 60;
    blackProbeNode.left = voltmeterBodyNode.right + 60;
    voltmeterBodyNode.top = 50;
    Node.call( this, {
      children: [
        voltmeterBodyNode,
        redProbeNode,
        blackProbeNode
      ]
    } );
  }

  circuitConstructionKitBasics.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {} );
} );