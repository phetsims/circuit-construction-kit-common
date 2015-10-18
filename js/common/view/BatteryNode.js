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
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/battery.png' );

  /**
   *
   * @constructor
   */
  function BatteryNode( snapContext, battery ) {
    var imageNode = new Image( batteryImage );

    battery.startTerminalPositionProperty.link( function( startTerminalPosition ) {
      imageNode.translation = startTerminalPosition;
    } );
    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode
      ]
    } );

    var terminalPositionProperty = battery.startTerminalPositionProperty;
    this.movableDragHandler = new MovableDragHandler( terminalPositionProperty, {
      onDrag: function( event ) {

        // check for available nearby nodes to snap to
        //var targets = snapContext.getAvailableTargets( wire, terminalPositionProperty );
        //if ( targets.length > 0 ) {
        //
        //  // choose the 1st one arbitrarily
        //  terminalPositionProperty.set( targets[ 0 ].terminalPositionProperty.get() );
        //}
        //
        //snapContext.wireTerminalDragged( wire, terminalPositionProperty );
      },
      endDrag: function( event ) {

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

  circuitConstructionKitBasics.register( 'BatteryNode', BatteryNode );

  return inherit( Node, BatteryNode );
} );