// Copyright 2016-2025, University of Colorado Boulder

/**
 * Abstract base class for WireNode and FixedCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TProperty from '../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import type Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import AccessibleDraggableOptions from '../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import InteractiveHighlighting from '../../../scenery/js/accessibility/voicing/InteractiveHighlighting.js';
import KeyboardListener from '../../../scenery/js/listeners/KeyboardListener.js';
import { type PressListenerEvent } from '../../../scenery/js/listeners/PressListener.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import type Vertex from '../model/Vertex.js';
import type CCKCScreenView from './CCKCScreenView.js';
import type CircuitNode from './CircuitNode.js';
import type CircuitNodeDragListener from './input/CircuitNodeDragListener.js';

type SelfOptions = {
  useHitTestForSensors?: boolean;
};

export type CircuitElementNodeOptions = SelfOptions & NodeOptions;

export default abstract class CircuitElementNode extends InteractiveHighlighting( Node ) {
  private readonly useHitTestForSensors: boolean;
  private readonly circuit: Circuit | null;
  public readonly circuitElement: CircuitElement;
  private dirty: boolean;
  public readonly abstract dragListener: CircuitNodeDragListener | null;

  /**
   * @param circuitElement - the CircuitElement to be rendered
   * @param circuit - the circuit which the element can be removed from or null for icons
   * @param showValuesProperty
   * @param selectionProperty
   * @param [providedOptions]
   */
  protected constructor(
    circuitElement: CircuitElement,
    circuit: Circuit | null,
    showValuesProperty: TReadOnlyProperty<boolean> | undefined,
    selectionProperty: TProperty<CircuitElement | Vertex | null> | undefined,
    providedOptions?: CircuitElementNodeOptions ) {

    providedOptions = optionize<CircuitElementNodeOptions, SelfOptions, NodeOptions>()( {
      useHitTestForSensors: false // if true, use the scenery mouse region hit test for fine-grained region. Otherwise, use bounds test.
    }, providedOptions );

    // When not an icon, enable keyboard navigation
    // let accessibleNameProperty: TReadOnlyProperty<string> | null = null;
    if ( circuit && showValuesProperty ) {

      providedOptions = optionize<CircuitElementNodeOptions, SelfOptions, NodeOptions>()( {


        ...AccessibleDraggableOptions,
        tagName: 'div', // HTML tag name for representative element in the document, see ParallelDOM.js
        focusable: true,
        phetioDynamicElement: true,
        phetioState: false,
        phetioVisiblePropertyInstrumented: false,
        phetioInputEnabledPropertyInstrumented: true,
        useHitTestForSensors: false,
        ariaRole: 'application',
        accessibleRoleDescription: 'edit component button'
      }, providedOptions );
    }

    super( providedOptions );

    if ( selectionProperty ) {
      this.addInputListener( new KeyboardListener( {
        keys: [ 'space', 'enter' ], // cannot use fireOnClick since this is also draggable
        press: () => {
          circuitElement.hasBeenKeyboardActivated = true;

          if ( selectionProperty.value === this.circuitElement ) {
            selectionProperty.value = null;
          }
          else {
            selectionProperty.value = this.circuitElement;
          }
        }
      } ) );
    }

    this.useHitTestForSensors = !!providedOptions.useHitTestForSensors;

    // the circuit which the element can be removed from or null for icons
    this.circuit = circuit;
    this.circuitElement = circuitElement;

    // Icons don't need interactive highlighting - subclasses set up their own highlights for non-icons
    if ( !circuit ) {
      this.interactiveHighlightEnabled = false;
    }

    // Make it easy to get back to circuitElements
    this.addLinkedElement( circuitElement, {
      tandemName: 'circuitElement'
    } );

    this.updateOpacityOnInteractiveChange();

    /**
     * When the object is created and dragged from the toolbox, the start drag method is forwarded through to start the
     * dragging.
     * @param event - scenery event
     */
    const startDragListener = ( event: PressListenerEvent ) => this.dragListener!.press( event, this );

    circuitElement.startDragEmitter.addListener( startDragListener );

    // Flag to indicate when updating view is necessary, in order to avoid duplicate work when both vertices move
    this.dirty = true;
    this.disposeEmitter.addListener( () => circuitElement.startDragEmitter.removeListener( startDragListener ) );

    // The LightBulbSocketNode is a full-blown FixedCircuitElementNode, but it is not pickable, so it should not be focusable.
    // Instead, the CCKCLightBulbNode handles focus for that circuitElement
    // Note that WireNode is pickable: null and still must be focused.
    if ( this.pickable || this.pickable === null ) {
      circuitElement.focusEmitter.addListener( () => this.focus() );
    }
  }

  /**
   * Mark dirty to batch changes, so that update can be done once in view step, if necessary
   */
  protected markAsDirty(): void {
    this.dirty = true;
  }

  /**
   * When interactivity changes, update the opacity.  Overridden.
   */
  public updateOpacityOnInteractiveChange(): void {

    // TODO (black-box-study): Replace this with grayscale if we keep it https://github.com/phetsims/tasks/issues/1129
    // TODO (black-box-study): @jonathonolson said: I've wished for a scenery-level grayscale/etc. filter. Let me know when you get close to doing this. https://github.com/phetsims/tasks/issues/1129
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
   * @param circuitNode
   * @param initialPoint
   * @param latestPoint
   * @param dragged
   * @param selectWhenNear
   */
  public endDrag( node: Node, vertices: Vertex[], screenView: CCKCScreenView, circuitNode: CircuitNode, initialPoint: Vector2, latestPoint: Vector2, dragged: boolean, selectWhenNear: boolean ): void {
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
            circuitNode.endDrag( vertex, dragged );
          }
        } );

        // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was
        // triggered by dispose()
        if ( selectWhenNear ) {
          this.selectCircuitElementNodeWhenNear( circuitNode, initialPoint, latestPoint );
        }
      }
    }
  }

  /**
   * On tap events, select the CircuitElement (if it is close enough to the tap)
   */
  private selectCircuitElementNodeWhenNear( circuitNode: CircuitNode, startPoint: Vector2, latestPoint: Vector2 | null ): void {

    if ( !this.circuitElement.isDisposed && latestPoint && latestPoint.distance( startPoint ) < CCKCConstants.TAP_THRESHOLD ) {

      circuitNode.circuit.selectionProperty.value = this.circuitElement;

      // focus the element for keyboard interaction
      // in the state wrapper, the destination frame tries to apply this delete first, which steals it from the upstream frame
      const ignoreFocus = phet.preloads.phetio && phet.preloads.phetio.queryParameters.frameTitle === 'destination';
      if ( !ignoreFocus ) {
        this.focus();
      }
    }
  }
}

circuitConstructionKitCommon.register( 'CircuitElementNode', CircuitElementNode );