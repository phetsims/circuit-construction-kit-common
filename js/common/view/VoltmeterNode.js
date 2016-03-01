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
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Util = require( 'DOT/Util' );

  // images
  var voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/voltmeter_body.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_red.png' );
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_black.png' );

  function VoltmeterNode( voltmeter, options ) {
    options = _.extend( { icon: false }, options );
    this.voltmeter = voltmeter;
    var s = 0.5;
    var redProbeNode = new Image( redProbe, { scale: 0.67 * s, cursor: 'pointer' } );
    this.redProbeNode = redProbeNode;
    var blackProbeNode = new Image( blackProbe, { scale: 0.67 * s, cursor: 'pointer' } );
    this.blackProbeNode = blackProbeNode;

    // TODO: Factor out readout region for reuse in ammeter
    var readout = new Text( '?', { fontSize: 34 } );
    var textBox = new Rectangle( 0, 0, 140, 52, 10, 10, {
      lineWidth: 2, stroke: 'black', fill: 'white'
    } );
    voltmeter.voltageProperty.link( function( voltage ) {
      readout.setText( voltage === null ? '?' : Util.toFixed( voltage, 2 ) + ' V' );
      if ( voltage === null ) {
        readout.centerX = textBox.centerX;
      }
      else {
        readout.right = textBox.right - 10;
      }
      readout.bottom = textBox.bottom;
    } );

    var bodyNode = new Image( voltmeterBodyImage, {
      scale: s, cursor: 'pointer', children: [
        new VBox( {
          spacing: 6,
          centerX: voltmeterBodyImage[ 0 ].width / 2,
          centerY: voltmeterBodyImage[ 0 ].height / 2,
          align: 'center',
          children: [ new Text( 'Voltage', { fontSize: 42 } ), new Node( {
            children: [ textBox, readout ]
          } ) ]
        } )
      ]
    } );
    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.centerTop = bodyPosition;
    } );

    voltmeter.redProbePositionProperty.link( function( redProbePosition ) {
      redProbeNode.centerTop = redProbePosition;
    } );

    voltmeter.blackProbePositionProperty.link( function( blackProbePosition ) {
      blackProbeNode.centerTop = blackProbePosition;
    } );

    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {
      if ( voltmeter.draggingTogether ) {
        voltmeter.redProbePosition = voltmeter.bodyPosition.plusXY( -100, -30 );
        voltmeter.blackProbePosition = voltmeter.bodyPosition.plusXY( 100, -30 );
      }
    } );

    Node.call( this, {
      pickable: true,
      children: [
        bodyNode,
        redProbeNode,
        blackProbeNode
      ]
    } );
    this.movableDragHandler = new MovableDragHandler( voltmeter.bodyPositionProperty, {
      endDrag: function() {
        voltmeter.droppedEmitter.emit1( bodyNode.globalBounds );

        // After dropping in the play area the probes move indepdently of the body
        voltmeter.draggingTogether = false;
      }
    } );
    !options.icon && bodyNode.addInputListener( this.movableDragHandler );

    !options.icon && redProbeNode.addInputListener( new MovableDragHandler( voltmeter.redProbePositionProperty, {} ) );

    !options.icon && blackProbeNode.addInputListener( new MovableDragHandler( voltmeter.blackProbePositionProperty, {} ) );
  }

  circuitConstructionKitBasics.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {} );
} );