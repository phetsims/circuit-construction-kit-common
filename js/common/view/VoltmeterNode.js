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
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Util = require( 'DOT/Util' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ProbeTextNode' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  // images
  var voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/voltmeter_body.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_red.png' );
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/probe_black.png' );

  function VoltmeterNode( voltmeter, options ) {
    var voltmeterNode = this;
    options = _.extend( { icon: false }, options );
    this.voltmeter = voltmeter;
    var s = 0.5;
    this.redProbeNode = new Image( redProbe, { scale: 0.67 * s, cursor: 'pointer' } );
    this.blackProbeNode = new Image( blackProbe, { scale: 0.67 * s, cursor: 'pointer' } );

    var probeTextNode = new ProbeTextNode( new DerivedProperty( [ voltmeter.voltageProperty ], function( voltage ) {
      return voltage === null ? '?' : Util.toFixed( voltage, 2 ) + ' V';
    } ) );

    var bodyNode = new Image( voltmeterBodyImage, {
      scale: s, cursor: 'pointer', children: [
        new VBox( {
          spacing: 6,
          centerX: voltmeterBodyImage[ 0 ].width / 2,
          centerY: voltmeterBodyImage[ 0 ].height / 2,
          align: 'center',
          children: [ new Text( 'Voltage', { fontSize: 42 } ), probeTextNode ]
        } )
      ]
    } );
    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.centerTop = bodyPosition;
    } );

    voltmeter.redProbePositionProperty.link( function( redProbePosition ) {
      voltmeterNode.redProbeNode.centerTop = redProbePosition;
    } );

    voltmeter.blackProbePositionProperty.link( function( blackProbePosition ) {
      voltmeterNode.blackProbeNode.centerTop = blackProbePosition;
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
        this.redProbeNode,
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