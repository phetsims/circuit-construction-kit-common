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
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditContainerPanel' );

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

        var angle = endPosition.minus( startPosition ).angle(); // TODO: speed up maths
        // TODO: Simplify this matrix math.
        contentNode.resetTransform();
        contentNode.mutate( {
          scale: contentScale
        } );
        contentNode.rotateAround( new Vector2( 0, 0 ), angle );
        contentNode.x = startPosition.x;
        contentNode.y = startPosition.y;
        contentNode.translate( 0, -contentNodeHeight / 2 );
      },
      highlightOptions: {}
    }, options );
    this.circuitElement = circuitElement;

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

    circuitElement.startVertexProperty.lazyLink( relink );
    circuitElement.endVertexProperty.lazyLink( relink );

    // Add highlight (but not for icons)
    if ( circuitNode ) {
      var inset = -10;
      var highlightNode = new Rectangle( inset, inset, contentNode.width - inset * 2, contentNode.height - inset * 2, _.extend( options.highlightOptions, {
        stroke: 'yellow',
        lineWidth: 5,

        // TODO: Probably move the highlight to another node, so that its parent isn't image node
        // TODO: So that it can extend beyond the bounds without throwing off the layout
        scale: 1.0 / contentScale,
        pickable: false
      } ) );

      contentNode.addChild( highlightNode );
    }

    Node.call( this, {
      cursor: 'pointer',
      children: [
        contentNode
      ]
    } );

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    // TODO: Should not rotate when dragging by body
    var p = null;
    this.inputListener = new SimpleDragHandler( {
      start: function( event ) {
        p = event.pointer.point;
        circuitNode.startDrag( event.pointer.point, circuitElement.endVertex, false );
      },
      drag: function( event ) {
        circuitNode.drag( event.pointer.point, circuitElement.endVertex, false );
      },
      end: function( event ) {

        // If over the toolbox, then drop into it, and don't process further
        if ( circuitConstructionKitBasicsScreenView.canNodeDropInToolbox( fixedLengthCircuitElementNode ) ) {
          circuitConstructionKitBasicsScreenView.dropCircuitElementNodeInToolbox( fixedLengthCircuitElementNode );
          return;
        }

        circuitNode.endDrag( event, circuitElement.endVertex );

        // Only show the editor when tapped tap, not on every drag.
        // TODO: Shared code with VertexNode
        if ( event.pointer.point.distance( p ) < CircuitConstructionKitBasicsConstants.tapThreshold ) {

          circuitNode.circuit.lastCircuitElementProperty.set( circuitElement );

          // When the user clicks on anything else, deselect the vertex
          var deselect = function( event ) {

            // Detect whether the user is hitting something pickable in the CircuitElementEditContainerPanel
            var circuitElementEditContainerPanel = false;
            for ( var i = 0; i < event.trail.nodes.length; i++ ) {
              var trailNode = event.trail.nodes[ i ];
              if ( trailNode instanceof CircuitElementEditContainerPanel ) {
                circuitElementEditContainerPanel = true;
              }
            }

            // If the user clicked outside of the CircuitElementEditContainerPanel, then hide the edit panel and
            // deselect the circuitElement
            if ( !circuitElementEditContainerPanel ) {
              circuitNode.circuit.lastCircuitElementProperty.set( null );
              event.pointer.removeInputListener( listener ); // Thanks, hoisting!
            }
          };
          var listener = {
            mouseup: deselect,
            touchup: deselect
          };
          event.pointer.addInputListener( listener );
        }
      }
    } );
    !options.icon && contentNode.addInputListener( this.inputListener );

    if ( circuitNode ) {
      circuitNode.circuit.lastCircuitElementProperty.link( function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      } );
    }

    this.disposeFixedLengthCircuitElementNode = function() {
      if ( fixedLengthCircuitElementNode.inputListener.dragging ) {
        fixedLengthCircuitElementNode.inputListener.endDrag();
      }
      multilink && multilink.dispose();
    };
  }

  circuitConstructionKitBasics.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( Node, FixedLengthCircuitElementNode, {
    dispose: function() {
      this.disposeFixedLengthCircuitElementNode();
    }
  } );
} );
