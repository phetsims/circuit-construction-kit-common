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

  /**
   *
   * @constructor
   */
  function FixedLengthComponentNode( circuit, circuitElement, image ) {
    var fixedLengthComponentNode = this;
    this.circuitElement = circuitElement;
    var imageNode = new Image( image );

    // TODO: Relink when start vertex changes
    var multilink = null;
    var relink = function() {
      multilink && multilink.dispose();
      multilink = Property.multilink( [ circuitElement.startVertex.positionProperty, circuitElement.endVertex.positionProperty ], function( startPosition, endPosition ) {
        var angle = endPosition.minus( startPosition ).angle();// TODO: speed up maths
        // TODO: Simplify this matrix math.
        imageNode.resetTransform();
        imageNode.rotateAround( new Vector2( 0, 0 ), angle );
        imageNode.x = startPosition.x;
        imageNode.y = startPosition.y;
        imageNode.translate( 0, -image[ 0 ].height / 2 );
      } );
    };
    relink();

    circuitElement.startVertexProperty.lazyLink( relink );
    circuitElement.endVertexProperty.lazyLink( relink );

    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode
      ]
    } );

    // TODO: startVertex can change
    this.movableDragHandler = new MovableDragHandler( circuitElement.startVertex.positionProperty, {
      onDrag: function( event ) {
      },
      endDrag: function( event ) {
      }
    } );
    imageNode.addInputListener( this.movableDragHandler );

    // Replace input listeners when battery joined
    circuitElement.startVertexProperty.lazyLink( function( startVertex ) {
      if ( fixedLengthComponentNode.movableDragHandler.dragging ) {
        fixedLengthComponentNode.movableDragHandler.endDrag();
      }
      imageNode.removeInputListener( fixedLengthComponentNode.movableDragHandler );
      fixedLengthComponentNode.movableDragHandler = new MovableDragHandler( circuitElement.startVertex.positionProperty, {
        onDrag: function( event ) {
        },
        endDrag: function( event ) {
        }
      } );
      imageNode.addInputListener( fixedLengthComponentNode.movableDragHandler );
    } );
  }

  circuitConstructionKitBasics.register( 'FixedLengthComponentNode', FixedLengthComponentNode );

  return inherit( Node, FixedLengthComponentNode );
} );