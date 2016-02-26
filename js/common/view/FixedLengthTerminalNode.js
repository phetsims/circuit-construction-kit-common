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
   * @param snapContext
   * @param {FixedLengthComponent} component
   * @param {boolean} isStart
   * @constructor
   */
  function FixedLengthTerminalNode( snapContext, component, isStart ) {
    var fixedLengthTerminalNode = this;
    Circle.call( this, 20, CircuitConstructionKitBasicsConstants.terminalNodeAttributes );
    var terminalPositionProperty = isStart ? component.startTerminalPositionProperty : component.endTerminalPositionProperty;
    var oppositePositionProperty = (!isStart) ? component.startTerminalPositionProperty : component.endTerminalPositionProperty;
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

        var proposedAngle = location.minus( oppositePositionProperty.get() ).angle() + (isStart ? Math.PI : 0);

        // Rotate about the center
        component.angleProperty.set( proposedAngle );

        // translate toward the mouse
        component.position.set( component.position.plus( location.minus( terminalPositionProperty.get() ) ) );
      },
      end: function() {}
    } ) );
  }

  circuitConstructionKitBasics.register( 'FixedLengthTerminalNode', FixedLengthTerminalNode );

  return inherit( Circle, FixedLengthTerminalNode );
} );