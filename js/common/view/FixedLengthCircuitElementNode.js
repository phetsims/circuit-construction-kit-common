// Copyright 2015-2016, University of Colorado Boulder

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
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementNode' );

  /**
   * @param {CircuitConstructionKitBasicsScreenView} circuitConstructionKitBasicsScreenView
   * @param circuitNode - Null if an icon is created
   * @param circuitElement
   * @param {Node} contentNode - the node that will display the component
   * @param {number} contentScale - the scale factor to apply to the image for the size in the play area (icons are automatically scaled up)
   * @param options
   * @constructor
   */
  function FixedLengthCircuitElementNode( circuitConstructionKitBasicsScreenView, circuitNode, circuitElement, contentNode,
                                          contentScale, options ) {
    var fixedLengthCircuitElementNode = this;

    // Capture the original dimensions of the content node, without the highlight node
    var contentNodeHeight = contentNode.height;

    options = _.extend( {
      icon: false,
      updateLayout: function( startPosition, endPosition ) {
        FixedLengthCircuitElementNode.updateNodeTransform( contentNode, startPosition, endPosition, contentScale );
        contentNode.translate( 0, -contentNodeHeight / 2 );
      },
      highlightOptions: {}
    }, options );

    // Relink when start vertex changes
    var multilink = null;
    var relink = function() {
      multilink && multilink.dispose();
      multilink = Property.multilink( [
        circuitElement.startVertex.positionProperty,
        circuitElement.endVertex.positionProperty
      ], options.updateLayout );
    };
    relink();

    var moveToFront = function() {

      // Components outside the black box do not move in front of the overlay
      if ( circuitElement.interactive ) {
        fixedLengthCircuitElementNode.moveToFront();
        fixedLengthCircuitElementNode.circuitElement.startVertex.moveToFrontEmitter.emit();
        fixedLengthCircuitElementNode.circuitElement.endVertex.moveToFrontEmitter.emit();
      }
    };
    circuitElement.connectedEmitter.addListener( moveToFront );
    circuitElement.vertexSelectedEmitter.addListener( moveToFront );

    circuitElement.startVertexProperty.lazyLink( relink );
    circuitElement.endVertexProperty.lazyLink( relink );

    // Add highlight (but not for icons)
    if ( circuitNode ) {
      var inset = -FixedLengthCircuitElementNode.HIGHLIGHT_INSET;
      var highlightNode = new Rectangle(
        inset,
        inset,
        contentNode.width - inset * 2,
        contentNode.height - inset * 2,
        8,
        8,
        _.extend( options.highlightOptions, {
          stroke: CircuitConstructionKitBasicsConstants.highlightColor,
          lineWidth: CircuitConstructionKitBasicsConstants.highlightLineWidth,

          // TODO: Probably move the highlight to another node, so that its parent isn't image node
          // TODO: So that it can extend beyond the bounds without throwing off the layout
          scale: 1.0 / contentScale,
          pickable: false
        } ) );

      contentNode.addChild( highlightNode );
    }

    CircuitElementNode.call( this, circuitElement, {
      cursor: 'pointer',
      children: [
        contentNode
      ]
    } );

    circuitElement.interactiveProperty.link( function( interactive ) {
      fixedLengthCircuitElementNode.pickable = interactive;
    } );

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    // TODO: Should not rotate when dragging by body
    var p = null;
    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;
        circuitElement.interactive && circuitNode.startDrag( event.pointer.point, circuitElement.endVertex, false );
      },
      drag: function( event ) {
        circuitElement.interactive && circuitNode.drag( event.pointer.point, circuitElement.endVertex, false );
      },
      end: function( event ) {

        // If over the toolbox, then drop into it, and don't process further
        if ( circuitConstructionKitBasicsScreenView.canNodeDropInToolbox( fixedLengthCircuitElementNode ) ) {
          circuitConstructionKitBasicsScreenView.dropCircuitElementNodeInToolbox( fixedLengthCircuitElementNode );
          return;
        }

        if ( !circuitElement.interactive ) {
          return;
        }

        circuitNode.endDrag( event, circuitElement.endVertex );

        // Only show the editor when tapped, not on every drag.
        fixedLengthCircuitElementNode.maybeSelect( event, circuitNode, p );
      }
    } );
    !options.icon && contentNode.addInputListener( this.inputListener );

    if ( circuitNode ) {
      circuitNode.circuit.selectedCircuitElementProperty.link( function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      } );
    }

    this.disposeFixedLengthCircuitElementNode = function() {
      if ( fixedLengthCircuitElementNode.inputListener.dragging ) {
        fixedLengthCircuitElementNode.inputListener.endDrag();
      }
      multilink && multilink.dispose();
      multilink = null; // Mark null so it doesn't get disposed again in relink()
    };
  }

  circuitConstructionKitBasics.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( CircuitElementNode, FixedLengthCircuitElementNode, {
    dispose: function() {
      this.disposeFixedLengthCircuitElementNode();
    }
  }, {
    /**
     * Update the transform of a node. This is followed by a type-specific step for finishing the translation.
     * @param {Node} contentNode
     * @param {Vector2} startPosition
     * @param {Vector2} endPosition
     * @param {number} contentScale
     */
    updateNodeTransform: function( contentNode, startPosition, endPosition, contentScale ) {
      var angle = endPosition.minus( startPosition ).angle(); // TODO: speed up maths
      // TODO: Simplify this matrix math.
      contentNode.resetTransform();
      contentNode.mutate( {
        scale: contentScale
      } );
      contentNode.rotateAround( new Vector2( 0, 0 ), angle );
      contentNode.x = startPosition.x;
      contentNode.y = startPosition.y;
    },
    HIGHLIGHT_INSET: 10
  } );
} );
