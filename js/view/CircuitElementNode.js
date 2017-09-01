// Copyright 2016-2017, University of Colorado Boulder

/**
 * Abstract base class for WireNode and FixedCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitElementEditContainerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Input = require( 'SCENERY/input/Input' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {CircuitElement} circuitElement - the CircuitElement to be rendered
   * @param {Circuit|null} circuit - the circuit which the element can be removed from or null for icons
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementNode( circuitElement, circuit, options ) {

    var self = this;

    // @private (read-only) {Circuit|null} - the circuit which the element can be removed from or null for icons
    this.circuit = circuit;

    // @public (read-only) {CircuitElement} - the CircuitElement rendered by this node
    this.circuitElement = circuitElement;

    // @protected {SimpleDragHandler|null} - Supplied by subclasses so that events can be forwarded from the tool icons or null
    // if rendering an icon
    this.dragHandler = null;

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

          // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/307
          event.preventDefault();
          circuit.circuitElements.remove( circuitElement );
        }
      }
    } );

    // @private {function[]}
    this.disposeActions = [];

    this.updateOpacityOnInteractiveChange();

    /**
     * When the object is created and dragged from the toolbox, the start drag method is forwarded through to start the
     * dragging.
     * @param event - scenery event
     */
      //REVIEW: var startDragListener = self.dragHandler.startDrag.bind( self.dragHandler )
      //REVIEW^(samreid): this didn't work out of the box because dragHandler is supplied later by subclasses. What do you recommend?
    var startDragListener = function( event ) {
        self.dragHandler.startDrag( event );
      };

    // @private {function} - for disposal
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
     * @override
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
      // TODO (black-box-study): @jonathonolson said: I've wished for a scenery-level grayscale/etc. filter. Let me know when you get close to doing this.
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
     * @public
     */
    containsSensorPoint: function( point ) {

      // default implementation is a scenery geometry containment test
      return this.containsPoint( point );
    },

    /**
     * Hook for view step, overriden in FixedCircuitElementNode
     * @public
     */
    step: function() {},

    /**
     * Handles when the node is dropped, called by subclass input listener.
     * @param {Event} event - scenery event, see https://github.com/phetsims/scenery/issues/608
     * @param {Node} node - the node the input listener is attached to
     * @param {Vertex[]} vertices - the vertices that are dragged
     * @param {CircuitConstructionKitScreenView} screenView - the main screen view, null for icon
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Vector2} start
     * @param {boolean} dragged
     * @public
     */
    endDrag: function( event, node, vertices, screenView, circuitLayerNode, start, dragged ) {
      var self = this;
      var circuitElement = this.circuitElement;

      if ( circuitElement.interactiveProperty.get() ) {

        // If over the toolbox, then drop into it
        if ( screenView.canNodeDropInToolbox( self ) ) {

          var lifetime = phet.joist.elapsedTime - self.circuitElement.creationTime;
          var delayMS = Math.max( 500 - lifetime, 0 );

          // If the node hasn't been out too long, it hovers over the toolbox before falling in.  When a user clicks
          // and releases immediately, the node shows for some 500ms before dropping back into the toolbox so
          // the user can better see what is happening.  The node is not interactive during the remainder of the 500ms
          // while it is hovering.
          node.removeInputListener( self.dragHandler );

          // Make it impossible to drag vertices when about to drop back into box, see preceding comment and  https://github.com/phetsims/circuit-construction-kit-common/issues/279
          circuitLayerNode.getVertexNode( circuitElement.startVertexProperty.get() ).pickable = false;
          circuitLayerNode.getVertexNode( circuitElement.endVertexProperty.get() ).pickable = false;

          var id = setTimeout( function() {
            self.circuit.circuitElements.remove( circuitElement );
          }, delayMS );

          // If disposed by reset all button, clear the timeout
          circuitElement.disposeEmitter.addListener( clearTimeout.bind( null, id ) );
        }
        else {

          // End drag for each of the vertices
          vertices.forEach( function( vertex ) {
            if ( screenView.model.circuit.vertices.contains( vertex ) ) {
              circuitLayerNode.endDrag( event, vertex, dragged );
            }
          } );

          // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was
          // triggered by dispose()
          event && self.selectCircuitElementNodeWhenNear( event, circuitLayerNode, start );
        }
      }
    },

    /**
     * On tap events, select the CircuitElement (if it is close enough to the tap)
     * @param {Event} event - scenery input event
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Vector2} startPoint
     * @public
     */
    selectCircuitElementNodeWhenNear: function( event, circuitLayerNode, startPoint ) {
      var self = this;
      if ( event.pointer.point.distance( startPoint ) < CircuitConstructionKitCommonConstants.TAP_THRESHOLD ) {

        circuitLayerNode.circuit.selectedCircuitElementProperty.set( this.circuitElement );

        // focus the element for keyboard interaction
        this.focus();

        var disposeAction = function() {
          phet.joist.sim.display.removeInputListener( clickToDismissListener );
        };

        // listener for 'click outside to dismiss'
        var clickToDismissListener = {
          down: function( event ) {

            // if the target was in a CircuitElementEditContainerNode, don't dismiss the event because the user was
            // dragging the slider or pressing the trash button or another control in that panel
            var trails = event.target.getTrails( function( node ) {

              // If the user tapped any component in the CircuitElementContainerPanel or on the selected node
              // allow interaction to proceed normally.  Any other taps will deselect the circuit element
              return node instanceof CircuitElementEditContainerNode || node === self;
            } );

            if ( trails.length === 0 ) {
              phet.joist.sim.display.removeInputListener( clickToDismissListener );
              //REVIEW: Why the extra guard here? Is there a chance of double-removal?
              //REVIEW^(samreid): which guard is extra? The trails.length makes sure that the user wasn't interacting with the controls
              var index = self.disposeActions.indexOf( disposeAction );
              if ( index >= 0 ) {
                self.disposeActions.splice( index, 1 );
              }
              circuitLayerNode.circuit.selectedCircuitElementProperty.set( null );
            }
          }
        };
        phet.joist.sim.display.addInputListener( clickToDismissListener );

        // If the user deletes the element with the delete button, make sure to detach the display input listener
        // so the next drag will work right away,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/368
        this.disposeActions.push( disposeAction );
      }
      else {

        // deselect after dragging
        circuitLayerNode.circuit.selectedCircuitElementProperty.set( null );
      }
    }
  } );
} );