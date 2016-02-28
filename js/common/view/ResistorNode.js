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

    Property.multilink( [ resistor.startVertex.positionProperty, resistor.endVertex.positionProperty ], function( startPosition, endPosition ) {
      var angle = endPosition.minus( startPosition ).angle();// TODO: speed up maths
      // TODO: Simplify this matrix math.
      imageNode.resetTransform();
      imageNode.rotateAround( new Vector2( 0, 0 ), angle );
      imageNode.x = startPosition.x;
      imageNode.y = startPosition.y;
      imageNode.translate( 0, -resistorImage[ 0 ].height / 2 );
    } );
    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode
      ]
    } );

    //var terminalPositionProperty = resistor.startTerminalPositionProperty;
    this.movableDragHandler = new MovableDragHandler( resistor.startVertex.positionProperty, {
      onDrag: function( event ) {
      },
      endDrag: function( event ) {
      }
    } );
    this.addInputListener( this.movableDragHandler );
  }

  circuitConstructionKitBasics.register( 'ResistorNode', ResistorNode );

  return inherit( Node, ResistorNode );
} );