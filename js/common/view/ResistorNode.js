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
  var resistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/resistor.png' );

  /**
   *
   * @constructor
   */
  function ResistorNode( snapContext, resistor ) {
    this.resistor = resistor;
    var imageNode = new Image( resistorImage );

    resistor.angleProperty.link( function( angle ) {
      imageNode.rotation = angle;
    } );
    resistor.multilink( [ 'startTerminalPosition', 'angle' ], function( startTerminalPosition, angle ) {

      // TODO: Simplify this matrix math.
      imageNode.resetTransform();
      imageNode.rotateAround( new Vector2( 0, 0 ), angle );
      imageNode.x = startTerminalPosition.x;
      imageNode.y = startTerminalPosition.y;
      imageNode.translate( 0, -resistorImage[ 0 ].height / 2 );
    } );
    var startTerminalNode = new FixedLengthTerminalNode( snapContext, resistor, true );
    var endTerminalNode = new FixedLengthTerminalNode( snapContext, resistor, false );
    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode,
        startTerminalNode,
        endTerminalNode
      ]
    } );

    //var terminalPositionProperty = resistor.startTerminalPositionProperty;
    this.movableDragHandler = new MovableDragHandler( resistor.positionProperty, {
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

  circuitConstructionKitBasics.register( 'ResistorNode', ResistorNode );

  return inherit( Node, ResistorNode );
} );