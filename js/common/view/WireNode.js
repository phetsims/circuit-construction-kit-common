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
  var WireTerminalNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/WireTerminalNode' );
  var Line = require( 'SCENERY/nodes/Line' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @constructor
   */
  function WireNode( snapContext, wire ) {
    this.wire = wire;

    Node.call( this );
    var line = new Line( 0, 0, 100, 100, {
      stroke: 'black',
      lineWidth: 20,
      cursor: 'pointer',
      strokePickable: true
    } );
    this.addChild( line );
    wire.startTerminalPositionProperty.link( function( startTerminalPosition ) {
      line.setPoint1( startTerminalPosition );
    } );
    wire.endTerminalPositionProperty.link( function( endTerminalPosition ) {
      line.setPoint2( endTerminalPosition );
    } );
    var startWireTerminalNode = new WireTerminalNode( snapContext, wire, wire.startTerminalPositionProperty );
    this.addChild( startWireTerminalNode );

    var endWireTerminalNode = new WireTerminalNode( snapContext, wire, wire.endTerminalPositionProperty );
    this.addChild( endWireTerminalNode );

    this.movableDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        startWireTerminalNode.movableDragHandler.handleForwardedStartEvent( event );
        endWireTerminalNode.movableDragHandler.handleForwardedStartEvent( event );
      },
      drag: function( event ) {

        startWireTerminalNode.movableDragHandler.handleForwardedDragEvent( event );
        endWireTerminalNode.movableDragHandler.handleForwardedDragEvent( event );
      },
      end: function( event ) {

        startWireTerminalNode.movableDragHandler.handleForwardedEndEvent( event );
        endWireTerminalNode.movableDragHandler.handleForwardedEndEvent( event );
      }
    } );
    line.addInputListener( this.movableDragHandler );
  }

  return inherit( Node, WireNode );
} );