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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   *
   * @constructor
   */
  function FixedLengthComponentNode( circuitNode, circuitElement, image ) {
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

    this.movableDragHandler = new MovableDragHandler( circuitElement.startVertex.positionProperty, {
      onDrag: function( event ) {
      },
      endDrag: function( event ) {
      }
    } );
    imageNode.addInputListener( this.movableDragHandler );

    // Use whatever the start node currently is (it can changed), and let the circuit manage the dependent vertices
    this.movableDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        circuitNode.startDrag( event, circuitElement.startVertex );
      },
      drag: function( event ) {
        circuitNode.drag( event, circuitElement.startVertex );
      },
      end: function( event ) {
        circuitNode.endDrag( event, circuitElement.startVertex );
      }
    } );
    imageNode.addInputListener( this.movableDragHandler );
  }

  circuitConstructionKitBasics.register( 'FixedLengthComponentNode', FixedLengthComponentNode );

  return inherit( Node, FixedLengthComponentNode );
} );