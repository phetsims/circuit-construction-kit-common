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

  function VoltmeterNode( voltmeter ) {
    this.voltmeter = voltmeter;
    var s = 0.5;
    var redProbeNode = new Image( redProbe, { scale: 0.67 * s } );
    var blackProbeNode = new Image( blackProbe, { scale: 0.67 * s } );
    var voltmeterBodyNode = new Image( voltmeterBody, { scale: s } );
    voltmeterBodyNode.left = redProbeNode.right + 60 * s;
    blackProbeNode.left = voltmeterBodyNode.right + 60 * s;
    voltmeterBodyNode.top = 50 * s;
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