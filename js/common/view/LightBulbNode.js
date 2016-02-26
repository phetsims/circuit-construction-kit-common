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
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var FixedLengthTerminalNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthTerminalNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/light-bulb.png' );

  /**
   *
   * @constructor
   */
  function LightBulbNode( snapContext, lightBulb ) {
    this.lightBulb = lightBulb;
    var imageNode = new Image( lightBulbImage );

    lightBulb.angleProperty.link( function( angle ) {
      imageNode.rotation = angle;
    } );
    lightBulb.multilink( [ 'startTerminalPosition', 'angle' ], function( startTerminalPosition, angle ) {

      // TODO: Simplify this matrix math.
      imageNode.resetTransform();
      imageNode.rotateAround( new Vector2( 0, 0 ), angle );
      imageNode.x = startTerminalPosition.x;
      imageNode.y = startTerminalPosition.y;
      imageNode.translate( 0, -lightBulbImage[ 0 ].height / 2 );
    } );
    var startTerminalNode = new FixedLengthTerminalNode( snapContext, lightBulb, true );
    var endTerminalNode = new FixedLengthTerminalNode( snapContext, lightBulb, false );
    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode,
        startTerminalNode,
        endTerminalNode
      ]
    } );

    this.movableDragHandler = new MovableDragHandler( lightBulb.positionProperty, {
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

  circuitConstructionKitBasics.register( 'LightBulbNode', LightBulbNode );

  return inherit( Node, LightBulbNode );
} );