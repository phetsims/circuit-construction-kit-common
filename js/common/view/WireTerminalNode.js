// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   *
   * @constructor
   */
  function WireTerminalNode( snapContext, wire, terminalPositionProperty ) {
    this.wire = wire;
    var wireTerminalNode = this;
    Circle.call( this, 20, CircuitConstructionKitBasicsConstants.terminalNodeAttributes );
    terminalPositionProperty.link( function( terminalPosition ) {
      wireTerminalNode.center = terminalPosition;
    } );

    this.movableDragHandler = new MovableDragHandler( terminalPositionProperty, {
      onDrag: function( event ) {

        // check for available nearby nodes to snap to
        var targets = snapContext.getAvailableTargets( wire, terminalPositionProperty );
        if ( targets.length > 0 ) {

          // choose the 1st one arbitrarily
          terminalPositionProperty.set( targets[ 0 ].terminalPositionProperty.get() );
        }

        snapContext.wireTerminalDragged( wire, terminalPositionProperty );
      },
      endDrag: function( event ) {

        // check for available nearby nodes to snap to
        var targets = snapContext.getAvailableTargets( wire, terminalPositionProperty );
        if ( targets.length > 0 ) {

          terminalPositionProperty.set( targets[ 0 ].terminalPositionProperty.get() );

          // connect the terminals
          snapContext.connect(
            wire,
            terminalPositionProperty,
            targets[ 0 ].branch,
            targets[ 0 ].terminalPositionProperty
          );
        }
      }

    } );
    this.addInputListener( this.movableDragHandler );
  }

  return inherit( Circle, WireTerminalNode );
} );