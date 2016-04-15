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
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ProbeTextNode' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Util = require( 'DOT/Util' );
  var ProbeNode = require( 'SCENERY_PHET/ProbeNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ProbeWireNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var ammeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/ammeter_body.png' );

  // constants
  // measurements for the cubic curve for the wire nodes
  var BODY_LEAD_Y = -30;
  var PROBE_LEAD_Y = 15;

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  var PROBE_CONNECTION_POINT_DY = 8;

  /**
   * @param {Ammeter} ammeter
   * @param {Object} [options]
   * @constructor
   */
  function AmmeterNode( ammeter, options ) {
    var ammeterNode = this;
    options = _.extend( { icon: false }, options );
    var s = 0.5;
    this.ammeter = ammeter;

    var blackWireNode = new ProbeWireNode( 'black', new Vector2( 0, BODY_LEAD_Y ), new Vector2( 0, PROBE_LEAD_Y ) );

    var currentProperty = new DerivedProperty( [ ammeter.currentProperty ], function( current ) {

      // Ammeters in this sim only show positive values, not direction (which is arbitrary anyways)
      return current === null ? '?' : Util.toFixed( Math.abs( current ), 2 ) + ' A';
    } );
    var probeTextNode = new ProbeTextNode( currentProperty, 'Current', {
      centerX: ammeterBodyImage[ 0 ].width / 2,
      centerY: ammeterBodyImage[ 0 ].height / 2
    } );

    var bodyNode = new Image( ammeterBodyImage, {
      scale: s,
      cursor: 'pointer',
      children: [
        probeTextNode
      ]
    } );
    var handleWidth = 50;
    this.probeNode = new ProbeNode( {
      cursor: 'pointer',
      sensorTypeFunction: ProbeNode.crosshairs(),
      scale: s,
      handleWidth: handleWidth,
      color: '#2c2c2b', // The dark gray border
      innerRadius: 43
    } );

    // Add a decoration on the handle to match the color scheme
    this.probeNode.addChild( new Rectangle( 0, 52, handleWidth * 0.72, 19, 6, 6, {
      centerX: 0,
      fill: '#e79547' // Match the orange of the ammeter image
    } ) );

    Node.call( this, {
      children: [ bodyNode, blackWireNode, this.probeNode ]
    } );
    ammeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.centerTop = bodyPosition;
      blackWireNode.setBodyPosition( bodyNode.centerTop.plusXY( 0, PROBE_CONNECTION_POINT_DY ) );
    } );

    ammeter.probePositionProperty.link( function( probePosition ) {
      ammeterNode.probeNode.centerTop = probePosition;
      blackWireNode.setProbePosition( ammeterNode.probeNode.centerBottom );
    } );
    ammeter.bodyPositionProperty.link( function( bodyPosition ) {
      if ( ammeter.draggingTogether ) {
        ammeter.probePosition = bodyPosition.plusXY( 80 / 2, -140 / 2 - 10 );
      }
    } );

    this.movableDragHandler = new MovableDragHandler( ammeter.bodyPositionProperty, {
      endDrag: function() {
        ammeter.droppedEmitter.emit1( bodyNode.globalBounds );

        // After dropping in the play area the probes move independently of the body
        ammeter.draggingTogether = false;
      }
    } );
    !options.icon && bodyNode.addInputListener( this.movableDragHandler );
    !options.icon && this.probeNode.addInputListener( new MovableDragHandler( ammeter.probePositionProperty, {} ) );
  }

  circuitConstructionKitBasics.register( 'AmmeterNode', AmmeterNode );

  return inherit( Node, AmmeterNode, {} );
} );