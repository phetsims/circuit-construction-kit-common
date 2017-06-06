// Copyright 2015-2017, University of Colorado Boulder

/**
 * Abstract base class for WireNode and FixedLengthCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Input = require( 'SCENERY/input/Input' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerPanel' );

  /**
   * @param {CircuitElement} circuitElement - the CircuitElement to be rendered
   * @param {Circuit} circuit - the circuit which the element can be removed from
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementNode( circuitElement, circuit, options ) {

    var self = this;

    // @public (read-only) - the CircuitElement rendered by this node
    this.circuitElement = circuitElement;

    // @public
    this.inputListener = null; // Supplied by subclasses

    options = _.extend( {

      // keyboard navigation
      tagName: 'div', // HTML tag name for representative element in the document, see Accessibility.js
      focusable: true,
      focusHighlight: 'invisible' // highlights are drawn by the simulation
    }, options );

    // Don't enable accessibility for the icons--it causes a bug in the homescreen icon
    if ( options.icon ) {
      delete options.tagName;
    }

    Node.call( this, options );

    // keyboard listener so that delete or backspace deletes the element - must be disposed
    var keyListener = this.addAccessibleInputListener( {
      keydown: function( event ) {
        var code = event.keyCode || event.which;

        // on delete or backspace, the focused circuit element should be deleted
        if ( code === Input.KEY_DELETE || code === Input.KEY_BACKSPACE ) {
          circuit.remove( circuitElement );
        }
      }
    } );

    // @private
    this.disposeActions = [];

    this.updateOpacityOnInteractiveChange();

    /**
     * When the object is created and dragged from the toolbox, the start drag method is forwarded through to start the
     * dragging.
     * @param event - scenery event
     */
    var startDragListener = function( event ) {
      self.inputListener.startDrag( event );
    };

    // @private - for disposal
    this.disposeCircuitElementNode = function() {

      // remove the keyboard listener
      self.removeAccessibleInputListener( keyListener );

      self.disposeActions.forEach( function( element ) {
        element();
      } );
      self.disposeActions.length = 0;
    };

    circuitElement.startDragEmitter.addListener( startDragListener );

    this.disposeActions.push( function() {
      circuitElement.startDragEmitter.removeListener( startDragListener );
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementNode', CircuitElementNode );

  return inherit( Node, CircuitElementNode, {

    /**
     * Dispose resources when no longer used.
     * @public
     */
    dispose: function() {
      this.disposeCircuitElementNode();
      Node.prototype.dispose.call( this );
    },

    /**
     * When interactivity changes, update the opacity.  Overriden.
     * @public
     */
    updateOpacityOnInteractiveChange: function() {
      var self = this;

      // TODO (black-box-study): Replace this with grayscale if we keep it
      var interactivityChanged = function( interactive ) {
        self.opacity = interactive ? 1 : 0.5;
      };
      this.circuitElement.interactiveProperty.link( interactivityChanged );

      this.disposeActions.push( function() {
        self.circuitElement.interactiveProperty.unlink( interactivityChanged );
      } );
    },

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     */
    containsSensorPoint: function( point ) {

      // default implementation is a scenery hit test
      return this.containsPoint( point );
    },

    /**
     * Hook for view step, overriden in FixedLengthCircuitElementNode
     *
     */
    step: function() {},

    /**
     * Handles when the node is dropped, called by subclass input listener.
     * @param {Object} event - scenery event
     * @param {Node} node - the node the input listener is attached to
     * @param {Vertex[]} vertices - the vertices that are dragged
     * @param {CCKScreenView} circuitConstructionKitScreenView
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Vector2} startPoint
     * @param {boolean} dragged
     */
    endDrag: function( event, node, vertices, circuitConstructionKitScreenView, circuitLayerNode, startPoint, dragged ) {
      var self = this;
      var circuitElement = this.circuitElement;

      if ( !circuitElement.interactiveProperty.get() ) {

        // nothing to do
      }

      // If over the toolbox, then drop into it, and don't process further
      else if ( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) ) {

        var lifetime = phet.joist.elapsedTime - self.circuitElement.creationTime;
        var delayMS = Math.max( 500 - lifetime, 0 );

        // If over the toolbox, then drop into it, and don't process further
        node.removeInputListener( self.inputListener );

        // Make it impossible to drag vertices when about to drop back into box
        // See https://github.com/phetsims/circuit-construction-kit-common/issues/279
        circuitLayerNode.getVertexNode( circuitElement.startVertexProperty.get() ).pickable = false;
        circuitLayerNode.getVertexNode( circuitElement.endVertexProperty.get() ).pickable = false;

        // If disposed by reset all button, clear the timeout
        circuitElement.disposeEmitter.addListener( function() { clearTimeout( id ); } );

        // If over the toolbox, then drop into it, and don't process further
        var id = setTimeout( function() {
          circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( self );
        }, delayMS );

        // If disposed by reset all button, clear the timeout
        circuitElement.disposeEmitter.addListener( function() { clearTimeout( id ); } );
      }
      else {

        // End drag for each of the vertices
        vertices.forEach( function( vertexProperty ) {
          circuitLayerNode.endDrag( event, vertexProperty, dragged );
        } );

        // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was triggered
        // by dispose()
        event && self.selectCircuitElementNodeWhenNear( event, circuitLayerNode, startPoint );
      }
    },

    /**
     * On tap events, select the CircuitElement (if it is close enough to the tap)
     * @param {Object} event - scenery input event
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Vector2} startPoint
     * @public
     */
    selectCircuitElementNodeWhenNear: function( event, circuitLayerNode, startPoint ) {
      var self = this;
      if ( event.pointer.point.distance( startPoint ) < CircuitConstructionKitConstants.TAP_THRESHOLD ) {

        circuitLayerNode.circuit.selectedCircuitElementProperty.set( this.circuitElement );

        // focus the element for keyboard interaction
        this.focus();

        // When the user clicks on anything else, deselect the Circuit Element
        var rootNode = this.getUniqueTrail().rootNode();

        // listener for 'click outside to dismiss'
        var clickToDismissListener = {
          down: function( event ) {

            // if the target was in a CircuitElementEditContainerPanel, don't dismiss the event because the user was
            // dragging the slider or pressing the trash button or another control in that panel
            var trails = event.target.getTrails( function( node ) {

              // If the user tapped any component in the CircuitElementContainerPanel or on the selected node
              // allow interaction to proceed normally.  Any other taps will deselect the circuit element
              return node instanceof CircuitElementEditContainerPanel || node === self;
            } );

            if ( trails.length === 0 ) {
              rootNode.removeInputListener( clickToDismissListener );
              circuitLayerNode.circuit.selectedCircuitElementProperty.set( null );
            }
          }
        };
        rootNode.addInputListener( clickToDismissListener );
      }
      else {

        // deselect after dragging
        circuitLayerNode.circuit.selectedCircuitElementProperty.set( null );
      }
    }
  } );
} );