// Copyright 2016-2022, University of Colorado Boulder

/**
 * Abstract base class for WireNode and FixedCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import { KeyboardListener, Node, NodeOptions, SceneryEvent } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import CircuitElementEditContainerNode from './CircuitElementEditContainerNode.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import Vertex from '../model/Vertex.js';
import DisplayClickToDismissListener from '../../../joist/js/DisplayClickToDismissListener.js';
import optionize from '../../../phet-core/js/optionize.js';

type SelfOptions = {
  useHitTestForSensors?: boolean;
};

export type CircuitElementNodeOptions = SelfOptions & NodeOptions;

export default abstract class CircuitElementNode extends Node {
  private readonly useHitTestForSensors: boolean;
  private readonly circuit: Circuit | null;
  public readonly circuitElement: CircuitElement;
  private readonly disposeCircuitElementNode: () => void;
  private dirty: boolean;

  /**
   * @param circuitElement - the CircuitElement to be rendered
   * @param circuit - the circuit which the element can be removed from or null for icons
   * @param [providedOptions]
   */
  public constructor( circuitElement: CircuitElement, circuit: Circuit | null, providedOptions?: CircuitElementNodeOptions ) {

    providedOptions = optionize<CircuitElementNodeOptions, SelfOptions, NodeOptions>()( {
      useHitTestForSensors: false // if true, use the scenery mouse region hit test for fine-grained region. Otherwise, use bounds test.
    }, providedOptions );

    // When not an icon, enable keyboard navigation
    if ( circuit ) {
      providedOptions = optionize<CircuitElementNodeOptions, SelfOptions, NodeOptions>()( {
        tagName: 'div', // HTML tag name for representative element in the document, see ParallelDOM.js
        focusable: true,
        focusHighlight: 'invisible', // highlights are drawn by the simulation, invisible is deprecated don't use in future
        phetioDynamicElement: true,
        phetioState: false,
        phetioInputEnabledPropertyInstrumented: true,
        useHitTestForSensors: false
      }, providedOptions );
    }

    super( providedOptions );

    this.useHitTestForSensors = !!providedOptions.useHitTestForSensors;

    // the circuit which the element can be removed from or null for icons
    this.circuit = circuit;
    this.circuitElement = circuitElement;

    // Make it easy to get back to circuitElements
    this.addLinkedElement( circuitElement, {

      // @ts-expect-error
      tandem: providedOptions.tandem.createTandem( 'circuitElement' )
    } );

    // keyboard listener so that delete or backspace deletes the element - must be disposed
    const keyListener = new KeyboardListener( {
      keys: [ 'delete', 'backspace' ],
      callback( event ) {

        assert && assert( event, 'should not be called from any spot without a direct dom event' );

        // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/307
        event!.domEvent!.preventDefault();

        // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
        if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {

          // Only permit deletion if the circuit element is marked as disposable
          if ( circuitElement.isDisposableProperty.value ) {
            circuit!.disposeCircuitElement( circuitElement );
          }
        }
      }
    } );
    this.addInputListener( keyListener );

    this.updateOpacityOnInteractiveChange();

    /**
     * When the object is created and dragged from the toolbox, the start drag method is forwarded through to start the
     * dragging.
     * @param event - scenery event
     */
      // @ts-expect-error
    const startDragListener = ( event: SceneryEvent ) => this.dragListener.down( event );

    this.disposeCircuitElementNode = () => {

      // remove the keyboard listener
      this.removeInputListener( keyListener );
    };

    circuitElement.startDragEmitter.addListener( startDragListener );

    // Flag to indicate when updating view is necessary, in order to avoid duplicate work when both vertices move
    this.dirty = true;
    this.disposeEmitter.addListener( () => circuitElement.startDragEmitter.removeListener( startDragListener ) );
  }

  /**
   * Mark dirty to batch changes, so that update can be done once in view step, if necessary
   */
  protected markAsDirty(): void {
    this.dirty = true;
  }

  /**
   * Dispose resources when no longer used.
   */
  public override dispose(): void {
    this.disposeCircuitElementNode();
    super.dispose();
  }

  /**
   * When interactivity changes, update the opacity.  Overridden.
   */
  public updateOpacityOnInteractiveChange(): void {

    // TODO (black-box-study): Replace this with grayscale if we keep it
    // TODO (black-box-study): @jonathonolson said: I've wished for a scenery-level grayscale/etc. filter. Let me know when you get close to doing this.
    const interactivityChanged = ( interactive: boolean ) => {
      this.opacity = interactive ? 1 : 0.5;
    };
    this.circuitElement.interactiveProperty.link( interactivityChanged );

    this.disposeEmitter.addListener( () => this.circuitElement.interactiveProperty.unlink( interactivityChanged ) );
  }

  /**
   * Returns true if the node hits the sensor at the given point.
   */
  public containsSensorPoint( globalPoint: Vector2 ): boolean {

    const localPoint = this.globalToParentPoint( globalPoint );

    // make sure bounds are correct if cut or joined in this animation frame
    this.step();

    if ( this.useHitTestForSensors ) {

      // Check against the mouse region
      return !!this.hitTest( localPoint, true, false );
    }
    else {

      // default implementation is a scenery geometry containment test
      return this.containsPoint( localPoint );
    }
  }

  /**
   * called during the view step
   */
  public step(): void {
    if ( this.dirty ) {

      this.updateRender();
      this.dirty = false;
    }
  }

  public abstract updateRender(): void;

  /**
   * Handles when the node is dropped, called by subclass input listener.
   * @param node - the node the input listener is attached to
   * @param vertices - the vertices that are dragged
   * @param screenView - the main screen view, null for icon
   * @param circuitLayerNode
   * @param initialPoint
   * @param latestPoint
   * @param dragged
   */
  protected endDrag( node: Node, vertices: Vertex[], screenView: CCKCScreenView, circuitLayerNode: CircuitLayerNode, initialPoint: Vector2, latestPoint: Vector2, dragged: boolean ): void {
    const circuitElement = this.circuitElement;

    if ( circuitElement.interactiveProperty.get() ) {

      // If over the toolbox, then drop into it
      if ( screenView.canNodeDropInToolbox( this ) ) {
        this.circuit!.disposeCircuitElement( circuitElement );
      }
      else {

        // End drag for each of the vertices
        vertices.forEach( vertex => {
          if ( screenView.model.circuit.vertexGroup.includes( vertex ) ) {
            circuitLayerNode.endDrag( vertex, dragged );
          }
        } );

        // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was
        // triggered by dispose()
        this.selectCircuitElementNodeWhenNear( circuitLayerNode, initialPoint, latestPoint );
      }
    }
  }

  /**
   * On tap events, select the CircuitElement (if it is close enough to the tap)
   */
  private selectCircuitElementNodeWhenNear( circuitLayerNode: CircuitLayerNode, startPoint: Vector2, latestPoint: Vector2 | null ): void {

    if ( !this.circuitElement.isDisposed && latestPoint && latestPoint.distance( startPoint ) < CCKCConstants.TAP_THRESHOLD ) {

      circuitLayerNode.circuit.selectionProperty.set( this.circuitElement );

      // focus the element for keyboard interaction
      // in the state wrapper, the destination frame tries to apply this delete first, which steals it from the upstream frame
      const ignoreFocus = phet.preloads.phetio && phet.preloads.phetio.queryParameters.frameTitle === 'destination';
      if ( !ignoreFocus ) {
        this.focus();
      }

      const disposeListener = () => {
        phet.joist.display.removeInputListener( clickToDismissListener );
        clickToDismissListener.dispose();
      };

      // listener for 'click outside to dismiss'
      const dismissListener = ( event: SceneryEvent ) => {

        // if the target was in a CircuitElementEditContainerNode, don't dismiss the event because the user was
        // dragging the slider or pressing the trash button or another control in that panel
        const trails = event.target.getTrails( ( node: Node ) => {

          // If the user tapped any component in the CircuitElementContainerPanel or on the selected node
          // allow interaction to proceed normally.  Any other taps will deselect the circuit element
          return node instanceof CircuitElementEditContainerNode || node === this;
        } );

        if ( trails.length === 0 ) {
          disposeListener();
          if ( this.disposeEmitter.hasListener( disposeListener ) ) {
            this.disposeEmitter.removeListener( disposeListener );
          }
          circuitLayerNode.circuit.selectionProperty.set( null );
        }
      };

      const clickToDismissListener = new DisplayClickToDismissListener( dismissListener );
      phet.joist.display.addInputListener( clickToDismissListener );

      // If the user deletes the element with the delete button, make sure to detach the display input listener
      // so the next drag will work right away,
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/368
      this.disposeEmitter.addListener( disposeListener );
    }
    else {

      // deselect after dragging
      circuitLayerNode.circuit.selectionProperty.set( null );
    }
  }
}

circuitConstructionKitCommon.register( 'CircuitElementNode', CircuitElementNode );