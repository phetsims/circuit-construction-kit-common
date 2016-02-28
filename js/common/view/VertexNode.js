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
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  /**
   *
   * @constructor
   */
  function VertexNode( snapContext, vertex ) {
    this.vertex = vertex;
    //Circle.call( this, 20, { fill: CircuitConstructionKitBasicsConstants.wireColor } );
    Circle.call( this, 20, CircuitConstructionKitBasicsConstants.terminalNodeAttributes );
    var vertexNode = this;
    vertex.positionProperty.link( function( position ) {
      vertexNode.center = position;
    } );

    this.movableDragHandler = new MovableDragHandler( vertex.positionProperty, {
      onDrag: function( event ) {

        //snapContext.dragTerminal( wire, terminalPositionProperty );
        // check for available nearby nodes to snap to
        //var targets = snapContext.getAvailableTargets( wire, vertex.positionProperty );
        //if ( targets.length > 0 ) {
        //
        //  // choose the 1st one arbitrarily
        //  vertex.positionProperty.set( targets[ 0 ].terminalPositionProperty.get() );
        //}

        //snapContext.wireTerminalDragged( wire, vertex.positionProperty );
      },
      endDrag: function( event ) {

        //snapContext.endDragTerminal( wire, terminalPositionProperty );
        // check for available nearby nodes to snap to
        //var targets = snapContext.getAvailableTargets( wire, terminalPositionProperty );
        //if ( targets.length > 0 ) {
        //
        //  terminalPositionProperty.set( targets[ 0 ].terminalPositionProperty.get() );
        //
        //  // connect the terminals
        //  snapContext.connect(
        //    wire,
        //    terminalPositionProperty,
        //    targets[ 0 ].branch,
        //    targets[ 0 ].terminalPositionProperty
        //  );
        //}
      }

    } );
    this.addInputListener( this.movableDragHandler );
  }

  circuitConstructionKitBasics.register( 'VertexNode', VertexNode );

  return inherit( Circle, VertexNode );
} );