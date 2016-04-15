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
  var Util = require( 'DOT/Util' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ProbeTextNode' );
  var ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ProbeWireNode' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/voltmeter_body.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_red.png' );
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_black.png' );

  // constants

  // measurements for the cubic curve for the wire nodes
  var BODY_WIRE_LEAD_X = 45;
  var BODY_LEAD_Y = 15;
  var PROBE_LEAD_X = 0;
  var PROBE_LEAD_Y = 40;

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  var PROBE_CONNECTION_POINT_DY = -18;
  var PROBE_CONNECTION_POINT_DX = 8;

  function VoltmeterNode( voltmeter, options ) {
    var voltmeterNode = this;
    options = _.extend( { icon: false }, options );
    this.voltmeter = voltmeter;
    var s = 0.5;
    this.redProbeNode = new Image( redProbe, { scale: 0.67 * s, cursor: 'pointer' } );
    this.blackProbeNode = new Image( blackProbe, { scale: 0.67 * s, cursor: 'pointer' } );

    var voltageReadoutProperty = new DerivedProperty( [ voltmeter.voltageProperty ], function( voltage ) {
      return voltage === null ? '?' : Util.toFixed( voltage, 2 ) + ' V';
    } );
    var probeTextNode = new ProbeTextNode( voltageReadoutProperty, 'Voltage', {
      centerX: voltmeterBodyImage[ 0 ].width / 2,
      centerY: voltmeterBodyImage[ 0 ].height / 2
    } );

    var bodyNode = new Image( voltmeterBodyImage, {
      scale: s, cursor: 'pointer', children: [
        probeTextNode
      ]
    } );

    var redWireNode = new ProbeWireNode( 'red', new Vector2( -BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X, PROBE_LEAD_Y ) );
    var blackWireNode = new ProbeWireNode( 'black', new Vector2( BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X, PROBE_LEAD_Y ) );

    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.centerTop = bodyPosition;
      redWireNode.setBodyPosition( bodyNode.centerBottom.plusXY( -PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY ) );
      blackWireNode.setBodyPosition( bodyNode.centerBottom.plusXY( PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY ) );
    } );

    voltmeter.redProbePositionProperty.link( function( redProbePosition ) {
      voltmeterNode.redProbeNode.centerTop = redProbePosition;
      redWireNode.setProbePosition( voltmeterNode.redProbeNode.centerBottom );
    } );

    voltmeter.blackProbePositionProperty.link( function( blackProbePosition ) {
      voltmeterNode.blackProbeNode.centerTop = blackProbePosition;
      blackWireNode.setProbePosition( voltmeterNode.blackProbeNode.centerBottom );
    } );

    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {
      if ( voltmeter.draggingTogether ) {
        voltmeter.redProbePosition = bodyPosition.plusXY( -100, -30 );
        voltmeter.blackProbePosition = bodyPosition.plusXY( 100, -30 );
      }
    } );

    Node.call( this, {
      pickable: true,
      children: [
        bodyNode,
        redWireNode,
        this.redProbeNode,

        blackWireNode,
        this.blackProbeNode
      ]
    } );
    this.movableDragHandler = new MovableDragHandler( voltmeter.bodyPositionProperty, {
      endDrag: function() {
        voltmeter.droppedEmitter.emit1( bodyNode.globalBounds );

        // After dropping in the play area the probes move independently of the body
        voltmeter.draggingTogether = false;
      }
    } );
    !options.icon && bodyNode.addInputListener( this.movableDragHandler );
    !options.icon && this.redProbeNode.addInputListener( new MovableDragHandler( voltmeter.redProbePositionProperty, {} ) );
    !options.icon && this.blackProbeNode.addInputListener( new MovableDragHandler( voltmeter.blackProbePositionProperty, {} ) );
  }

  circuitConstructionKitBasics.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {} );
} );