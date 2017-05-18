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

      // TODO: Replace this with grayscale if we keep it
      var interactivityChanged = function( interactive ) {
        self.opacity = interactive ? 1 : 0.5;
      };
      this.circuitElement.interactiveProperty.link( interactivityChanged );

      this.disposeActions.push( function() {
        self.circuitElement.interactiveProperty.unlink( interactivityChanged );
      } );
    },

    /**
     * Create a scenery input listener that deselects the circuit element when the user clicks something else (unless
     * they click on the controls for the selected component)
     * @param {CircuitNode} circuitNode - the main circuit node
     * @returns {Object} the input listener
     * @private
     */
    createDeselectFunctionListener: function( circuitNode ) {
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
          circuitNode.circuit.selectedCircuitElementProperty.set( null );
          event.pointer.removeInputListener( listener ); // Thanks, hoisting!
        }
      };
      var listener = {
        mouseup: deselect,
        touchup: deselect
      };
      return listener;
    },

    /**
     * On tap events, select the vertex (if it is close enough to the tap)
     * @param {Object} event - scenery input event
     * @param {CircuitNode} circuitNode
     * @param {Vector2} startPoint
     * @public
     */
    selectCircuitElementNodeWhenNear: function( event, circuitNode, startPoint ) {

      if ( event.pointer.point.distance( startPoint ) < CircuitConstructionKitConstants.TAP_THRESHOLD ) {

        circuitNode.circuit.selectedCircuitElementProperty.set( this.circuitElement );

        // focus the element for keyboard interaction
        this.focus();

        // When the user clicks on anything else, deselect the vertex
        event.pointer.addInputListener( this.createDeselectFunctionListener( circuitNode ) );
      }
    }
  } );
} );