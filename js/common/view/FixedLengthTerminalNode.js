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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @constructor
   */
  function FixedLengthTerminalNode( snapContext, component, terminalPositionProperty ) {
    var fixedLengthTerminalNode = this;
    Circle.call( this, 20, CircuitConstructionKitBasicsConstants.terminalNodeAttributes );
    terminalPositionProperty.link( function( terminalPosition ) {
      fixedLengthTerminalNode.center = terminalPosition;
    } );

    var startOffset = null;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        var location = terminalPositionProperty.get();
        startOffset = fixedLengthTerminalNode.globalToParentPoint( event.pointer.point ).minus( location );
      },

      // TODO: Let's make it so the object can translate + rotate, so connections can be made while dragging by a terminal
      drag: function( event ) {

        var location = fixedLengthTerminalNode.globalToParentPoint( event.pointer.point ).minus( startOffset );

        var proposedAngle = location.minus( component.getOppositeTerminalPositionProperty( terminalPositionProperty ).get() ).angle();

        if ( component.endTerminalPositionProperty === terminalPositionProperty ) {

          // Want to set the terminalPositionProperty to be at location, but we are prevented because the object
          // is fixed length, so rotate it to the desired position.
          component.angleProperty.set( proposedAngle );

          // step toward the mouse
          //console.log( distanceFromMouse );
          component.startTerminalPositionProperty.set( component.startTerminalPositionProperty.get().plus( location.minus( terminalPositionProperty.get() ) ) );
        }
        else {

          // Keep the opposite terminal at the same location and rotate the object
          var pivot1 = component.getOppositeTerminalPositionProperty( terminalPositionProperty ).get();
          component.angleProperty.set( proposedAngle + Math.PI );

          // The opposite terminal has moved after changing the angle, we must find out how far it has moved
          // and translate everything back
          var pivot2 = component.getOppositeTerminalPositionProperty( terminalPositionProperty ).get();
          terminalPositionProperty.set( terminalPositionProperty.get().minusXY( pivot2.x - pivot1.x, pivot2.y - pivot1.y ) );
        }
      },
      end: function() {}
    } ) );
  }

  circuitConstructionKitBasics.register( 'FixedLengthTerminalNode', FixedLengthTerminalNode );

  return inherit( Circle, FixedLengthTerminalNode );
} );