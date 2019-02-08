// Copyright 2016-2017, University of Colorado Boulder

/**
 * Abstract base class for WireNode and FixedCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementEditContainerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {CircuitElement} circuitElement - the CircuitElement to be rendered
   * @param {Circuit|null} circuit - the circuit which the element can be removed from or null for icons
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementNode( circuitElement, circuit, options ) {

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
      focusHighlight: 'invisible' // highlights are drawn by the simulation, invisible is deprecated don't use in future
    }, options );

    Node.call( this, options );

    // keyboard listener so that delete or backspace deletes the element - must be disposed
    const keyListener = {
      keydown: event => {
        const code = event.domEvent.keyCode;

        // on delete or backspace, the focused circuit element should be deleted
        if ( code === KeyboardUtil.KEY_DELETE || code === KeyboardUtil.KEY_BACKSPACE ) {

          // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/307
          event.domEvent.preventDefault();

          // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {
            circuit.circuitElements.remove( circuitElement );
          }
        }
      }
    };
    this.addInputListener( keyListener );

    // @private {function[]}
    this.disposeActions = [];

    this.updateOpacityOnInteractiveChange();

    /**
     * When the object is created and dragged from the toolbox, the start drag method is forwarded through to start the
     * dragging.
     * @param event - scenery event
     */
    const startDragListener = event => this.dragHandler.startDrag( event );

    // @private {function} - for disposal
    this.disposeCircuitElementNode = () => {

      // remove the keyboard listener
      this.removeInputListener( keyListener );

      this.disposeActions.forEach( element => element() );
      this.disposeActions.length = 0;
    };

    circuitElement.startDragEmitter.addListener( startDragListener );

    // @private {boolean} - Flag to indicate when updating view is necessary, in order to avoid duplicate work when both
    // vertices move
    this.dirty = true;

    this.disposeActions.push( () => circuitElement.startDragEmitter.removeListener( startDragListener ) );
  }

  circuitConstructionKitCommon.register( 'CircuitElementNode', CircuitElementNode );

  return inherit( Node, CircuitElementNode, {

    /**
     * Mark dirty to batch changes, so that update can be done once in view step, if necessary
     * @public
     */
    markAsDirty: function() {
      this.dirty = true;
    },

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

      // TODO (black-box-study): Replace this with grayscale if we keep it
      // TODO (black-box-study): @jonathonolson said: I've wished for a scenery-level grayscale/etc. filter. Let me know when you get close to doing this.
      const interactivityChanged = interactive => {
        this.opacity = interactive ? 1 : 0.5;
      };
      this.circuitElement.interactiveProperty.link( interactivityChanged );

      this.disposeActions.push( () => this.circuitElement.interactiveProperty.unlink( interactivityChanged ) );
    },

    /**
     * Returns true if the node hits the sensor at the given point. It is the caller's responsibility to call
     * @param {Vector2} point
     * @returns {boolean}
     * @public
     */
    containsSensorPoint: function( point ) {

      // make sure bounds are correct if cut or joined in this animation frame
      this.step();

      // default implementation is a scenery geometry containment test
      return this.containsPoint( point );
    },

    /**
     * @public - called during the view step
     * @override
     */
    step: function() {
      if ( this.dirty ) {
        this.updateRender();
        this.dirty = false;
      }
    },

    /**
     * Handles when the node is dropped, called by subclass input listener.
     * @param {Event} event - scenery event, see https://github.com/phetsims/scenery/issues/608
     * @param {Node} node - the node the input listener is attached to
     * @param {Vertex[]} vertices - the vertices that are dragged
     * @param {CCKCScreenView} screenView - the main screen view, null for icon
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Vector2} start
     * @param {boolean} dragged
     * @public
     */
    endDrag: function( event, node, vertices, screenView, circuitLayerNode, start, dragged ) {
      const circuitElement = this.circuitElement;

      if ( circuitElement.interactiveProperty.get() ) {

        // If over the toolbox, then drop into it
        if ( screenView.canNodeDropInToolbox( this ) ) {

          this.circuit.circuitElements.remove( circuitElement );
        }
        else {

          // End drag for each of the vertices
          vertices.forEach( vertex => {
            if ( screenView.model.circuit.vertices.contains( vertex ) ) {
              circuitLayerNode.endDrag( event, vertex, dragged );
            }
          } );

          // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was
          // triggered by dispose()
          event && this.selectCircuitElementNodeWhenNear( event, circuitLayerNode, start );
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
      if ( event.pointer.point.distance( startPoint ) < CCKCConstants.TAP_THRESHOLD ) {

        circuitLayerNode.circuit.selectedCircuitElementProperty.set( this.circuitElement );

        // focus the element for keyboard interaction
        this.focus();

        const disposeAction = () => phet.joist.sim.display.removeInputListener( clickToDismissListener );

        // listener for 'click outside to dismiss'
        const clickToDismissListener = {
          down: event => {

            // if the target was in a CircuitElementEditContainerNode, don't dismiss the event because the user was
            // dragging the slider or pressing the trash button or another control in that panel
            const trails = event.target.getTrails( node => {

              // If the user tapped any component in the CircuitElementContainerPanel or on the selected node
              // allow interaction to proceed normally.  Any other taps will deselect the circuit element
              return node instanceof CircuitElementEditContainerNode || node === this;
            } );

            if ( trails.length === 0 ) {
              phet.joist.sim.display.removeInputListener( clickToDismissListener );
              const index = this.disposeActions.indexOf( disposeAction );
              if ( index >= 0 ) {
                this.disposeActions.splice( index, 1 );
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