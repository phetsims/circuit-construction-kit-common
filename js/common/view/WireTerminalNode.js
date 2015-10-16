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

  /**
   *
   * @constructor
   */
  function WireTerminalNode( wire, terminalPositionProperty ) {
    this.wire = wire;
    var wireTerminalNode = this;
    Circle.call( this, 20, { fill: 'gray', cursor: 'pointer' } );
    terminalPositionProperty.link( function( terminalPosition ) {
      wireTerminalNode.center = terminalPosition;
    } );

    this.movableDragHandler = new MovableDragHandler( terminalPositionProperty, {} );
    this.addInputListener( this.movableDragHandler );
  }

  return inherit( Circle, WireTerminalNode );
} );