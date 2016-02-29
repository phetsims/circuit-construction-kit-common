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
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // images
  var voltmeterBody = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/voltmeter_body.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_red.png' );
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_black.png' );

  function VoltmeterNode( voltmeter, options ) {
    options = _.extend( { icon: false }, options );
    this.voltmeter = voltmeter;
    var s = 0.5;
    var redProbeNode = new Image( redProbe, { scale: 0.67 * s } );
    var blackProbeNode = new Image( blackProbe, { scale: 0.67 * s } );
    var bodyNode = new Image( voltmeterBody, { scale: s } );
    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.center = bodyPosition;
    } );

    bodyNode.left = redProbeNode.right + 60 * s;
    blackProbeNode.left = bodyNode.right + 60 * s;
    bodyNode.top = 50 * s;
    Node.call( this, {
      children: [
        bodyNode,
        redProbeNode,
        blackProbeNode
      ]
    } );

    this.movableDragHandler = new MovableDragHandler( voltmeter.bodyPositionProperty );
    !options.icon && bodyNode.addInputListener( this.movableDragHandler );
  }

  circuitConstructionKitBasics.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {} );
} );