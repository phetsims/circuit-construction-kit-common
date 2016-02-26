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
  var ammeterBody = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/ammeter_body.png' );
  var ammeterProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/ammeter_probe.png' );

  function AmmeterNode() {
    var ammeterBodyNode = new Image( ammeterBody );
    var ammeterProbeNode = new Image( ammeterProbe, {
      scale: 0.6,
      left: ammeterBodyNode.centerX,
      bottom: ammeterBodyNode.top - 20
    } );
    Node.call( this, {
      children: [ ammeterBodyNode, ammeterProbeNode ]
    } );
  }

  circuitConstructionKitBasics.register( 'AmmeterNode', AmmeterNode );

  return inherit( Node, AmmeterNode, {} );
} );