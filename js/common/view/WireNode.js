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
  var Line = require( 'SCENERY/nodes/Line' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   *
   * @constructor
   */
  function WireNode( circuitNode, wire ) {
    this.wire = wire;

    Node.call( this );
    var line = new Line( 0, 0, 100, 100, {
      stroke: CircuitConstructionKitBasicsConstants.wireColor,
      lineWidth: 20,
      cursor: 'pointer',
      strokePickable: true
    } );
    this.addChild( line );

    // There is a double nested property, since the vertex may change and the position may change
    // TODO: Unlink old vertices
    wire.startVertexProperty.link( function( newStartVertex, oldStartVertex ) {
      newStartVertex.positionProperty.link( function( startPoint ) {
        line.setPoint1( startPoint );
      } );
    } );
    wire.endVertexProperty.link( function( newEndVertex, oldEndVertex ) {
      newEndVertex.positionProperty.link( function( endPoint ) {
        line.setPoint2( endPoint );
      } );
    } );

    this.movableDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        circuitNode.getVertexNode( wire.startVertex ).movableDragHandler.handleForwardedStartEvent( event );
        circuitNode.getVertexNode( wire.endVertex ).movableDragHandler.handleForwardedStartEvent( event );
      },
      drag: function( event ) {
        circuitNode.getVertexNode( wire.startVertex ).movableDragHandler.handleForwardedDragEvent( event );
        circuitNode.getVertexNode( wire.endVertex ).movableDragHandler.handleForwardedDragEvent( event );
      },
      end: function( event ) {
        circuitNode.getVertexNode( wire.startVertex ).movableDragHandler.handleForwardedEndEvent( event );
        circuitNode.getVertexNode( wire.endVertex ).movableDragHandler.handleForwardedEndEvent( event );
      }
    } );
    line.addInputListener( this.movableDragHandler );
  }

  return inherit( Node, WireNode );
} );