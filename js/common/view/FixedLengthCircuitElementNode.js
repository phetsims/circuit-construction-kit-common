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
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitElementNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param circuitNode - Null if an icon is created
   * @param circuitElement
   * @param {Node} contentNode - the node that will display the component
   * @param {number} contentScale - the scale factor to apply to the image for the size in the play area (icons are automatically scaled up)
   * @param options
   * @constructor
   */
  function FixedLengthCircuitElementNode( circuitConstructionKitScreenView, circuitNode, circuitElement, contentNode,
                                          contentScale, options ) {

    // TODO: Somehow the layout here assumes that the initial angle is zero.  If we set the angle to zero, then render
    // the nodes then restore the vertex position. it kind of works.
    var endVertexPosition = circuitElement.endVertex.position.copy();
    var dist = circuitElement.startVertex.position.distance( circuitElement.endVertex.position );
    circuitElement.endVertex.position = circuitElement.startVertex.position.plus( Vector2.createPolar( dist, 0 ) );
    var fixedLengthCircuitElementNode = this;

    // Capture the original dimensions of the content node, without the highlight node
    var contentNodeHeight = contentNode.height;

    var highlightParent = new Node();

    var scratchMatrix = new Matrix3();
    var scratchMatrix2 = new Matrix3();
    options = _.extend( {
      icon: false,
      updateLayout: function( startPosition, endPosition ) {
        var angle = endPosition.minus( startPosition ).angle();

        // Update the node transform in a single step, see #66
        scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
          .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
          .multiplyMatrix( scratchMatrix2.setToScale( contentScale ) )
          .multiplyMatrix( scratchMatrix2.setToTranslation( 0, -contentNodeHeight / 2 ) );
        contentNode.setMatrix( scratchMatrix );
        highlightNode && highlightParent.setMatrix( scratchMatrix.copy() );
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
          stroke: CircuitConstructionKitConstants.highlightColor,
          lineWidth: CircuitConstructionKitConstants.highlightLineWidth,
          scale: 1.0 / contentScale,
          pickable: false
        } ) );

      highlightParent.children = [ highlightNode ];
      circuitNode.highlightLayer.addChild( highlightParent );

      this.highlightParent = highlightParent;
    }

    CircuitElementNode.call( this, circuitElement, {
      cursor: 'pointer',
      children: [
        contentNode
      ]
    } );

    var pickableListener = function( interactive ) {
      fixedLengthCircuitElementNode.pickable = interactive;
    };
    circuitElement.interactiveProperty.link( pickableListener );

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
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
        if ( circuitConstructionKitScreenView.canNodeDropInToolbox( fixedLengthCircuitElementNode ) ) {
          circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( fixedLengthCircuitElementNode );
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
      var updateSelectionHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      };
      circuitNode.circuit.selectedCircuitElementProperty.link( updateSelectionHighlight );
    }

    circuitElement.endVertex.position = endVertexPosition;

    // TODO: options.updateLayout doesn't seem optional
    // Update after the highlight exists
    options.updateLayout(
      circuitElement.startVertex.position,
      circuitElement.endVertex.position
    );

    this.disposeFixedLengthCircuitElementNode = function() {
      if ( fixedLengthCircuitElementNode.inputListener.dragging ) {
        fixedLengthCircuitElementNode.inputListener.endDrag();
      }
      multilink && multilink.dispose();
      multilink = null; // Mark null so it doesn't get disposed again in relink()

      updateSelectionHighlight && circuitNode.circuit.selectedCircuitElementProperty.unlink( updateSelectionHighlight );

      circuitElement.connectedEmitter.removeListener( moveToFront );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFront );

      circuitElement.interactiveProperty.unlink( pickableListener );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightParent );
    };
  }

  circuitConstructionKit.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( CircuitElementNode, FixedLengthCircuitElementNode, {
    dispose: function() {
      this.disposeFixedLengthCircuitElementNode();
    }
  }, {
    HIGHLIGHT_INSET: 10
  } );
} );
