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
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   *
   * @param circuitNode - Null if an icon is created
   * @param circuitElement
   * @param image
   * @param {number} imageScale - the scale factor to apply to the image for the size in the play area (icons are automatically scaled up)
   * @param options
   * @constructor
   */
  function FixedLengthComponentNode( circuitNode, circuitElement, image, imageScale, options ) {
    var fixedLengthComponentNode = this;
    options = _.extend( {
      icon: false
    }, options );
    this.circuitElement = circuitElement;

    // @protected (for ResistorNode to paint the color bands on)
    this.imageNode = new Image( image );

    var imageNode = this.imageNode;

    // Relink when start vertex changes
    var multilink = null;
    var relink = function() {
      multilink && multilink.dispose();
      multilink = Property.multilink( [ circuitElement.startVertex.positionProperty, circuitElement.endVertex.positionProperty ], function( startPosition, endPosition ) {
        var angle = endPosition.minus( startPosition ).angle(); // TODO: speed up maths
        // TODO: Simplify this matrix math.
        imageNode.resetTransform();
        imageNode.mutate( {
          scale: imageScale
        } );
        imageNode.rotateAround( new Vector2( 0, 0 ), angle );
        imageNode.x = startPosition.x;
        imageNode.y = startPosition.y;
        imageNode.translate( 0, -image[ 0 ].height / 2 );
      } );
    };
    relink();

    circuitElement.startVertexProperty.lazyLink( relink );
    circuitElement.endVertexProperty.lazyLink( relink );

    if ( circuitNode ) {
      var inset = 2;
      var highlightNode = new Rectangle( inset, inset, imageNode.width - inset * 2, imageNode.height - inset * 2, {
        stroke: 'yellow',
        lineWidth: 10,
        scale: 1.0 / imageScale // TODO: Probably move the highlight to another node, so that its parent isn't image node
                                // TODO: So that it can extend beyond the bounds without throwing off the layout
      } );

      imageNode.addChild( highlightNode );
    }

    Node.call( this, {
      cursor: 'pointer',
      children: [
        imageNode
      ]
    } );

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    // TODO: Should not rotate when dragging by body
    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        circuitNode.startDrag( event, circuitElement.endVertex );
      },
      drag: function( event ) {
        circuitNode.drag( event, circuitElement.endVertex );
      },
      end: function( event ) {
        circuitNode.endDrag( event, circuitElement.endVertex );
        circuitNode.circuit.lastCircuitElementProperty.set( circuitElement );
      }
    } );
    !options.icon && imageNode.addInputListener( this.inputListener );

    if ( circuitNode ) {
      circuitNode.circuit.lastCircuitElementProperty.link( function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      } );
    }

    this.disposeFixedLengthComponentNode = function() {
      if ( fixedLengthComponentNode.inputListener.dragging ) {
        fixedLengthComponentNode.inputListener.endDrag();
      }
      multilink && multilink.dispose();
    };
  }

  circuitConstructionKitBasics.register( 'FixedLengthComponentNode', FixedLengthComponentNode );

  return inherit( Node, FixedLengthComponentNode, {
    dispose: function() {
      this.disposeFixedLengthComponentNode();
    }
  } );
} );
