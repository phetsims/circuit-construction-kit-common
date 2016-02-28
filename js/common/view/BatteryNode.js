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
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/battery.png' );

  /**
   *
   * @constructor
   */
  function BatteryNode( snapContext, battery ) {
    this.battery = battery;
    var imageNode = new Image( batteryImage );

    battery.angleProperty.link( function( angle ) {
      imageNode.rotation = angle;
    } );

    // TODO: Relink when start vertex changes
    Property.multilink( [ battery.startVertex.positionProperty, battery.endVertex.positionProperty ], function( startPosition, endPosition ) {
      var angle = endPosition.minus( startPosition ).angle();// TODO: speed up maths
      // TODO: Simplify this matrix math.
      imageNode.resetTransform();
      imageNode.rotateAround( new Vector2( 0, 0 ), angle );
      imageNode.x = startPosition.x;
      imageNode.y = startPosition.y;
      imageNode.translate( 0, -batteryImage[ 0 ].height / 2 );
    } );

    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode
      ]
    } );

    // TODO: startVertex can change
    this.movableDragHandler = new MovableDragHandler( battery.startVertex.positionProperty, {
      onDrag: function( event ) {
      },
      endDrag: function( event ) {
      }
    } );
    imageNode.addInputListener( this.movableDragHandler );
  }

  circuitConstructionKitBasics.register( 'BatteryNode', BatteryNode );

  return inherit( Node, BatteryNode );
} );