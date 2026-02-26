// Copyright 2017-2026, University of Colorado Boulder

/**
 * An icon in the circuit element toolbox/carousel that can be used to create circuit elements. Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import type Property from '../../../axon/js/Property.js';
import type ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import ParallelDOM from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import InteractiveHighlighting from '../../../scenery/js/accessibility/voicing/InteractiveHighlighting.js';
import Grayscale from '../../../scenery/js/filters/Grayscale.js';
import VBox, { type VBoxOptions } from '../../../scenery/js/layout/nodes/VBox.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import KeyboardListener from '../../../scenery/js/listeners/KeyboardListener.js';
import { type PressListenerEvent } from '../../../scenery/js/listeners/PressListener.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import type CircuitElementType from '../model/CircuitElementType.js';
import type CircuitElementViewType from '../model/CircuitElementViewType.js';
import CCKCColors from './CCKCColors.js';

// constants
const TOOLBOX_ICON_WIDTH = CCKCConstants.TOOLBOX_ICON_WIDTH;

type SelfOptions = {
  touchAreaExpansionLeft?: number;
  touchAreaExpansionTop?: number;
  touchAreaExpansionRight?: number;
  touchAreaExpansionBottom?: number;

  additionalProperty?: ReadOnlyProperty<boolean>;
  ghostOpacity?: number;

  // When true, row-based placement fills to the left of the tool icon instead of the right.
  // Used for the series ammeter toolbox on the right side of the screen.
  keyboardCreateToLeft?: boolean;
};
export type CircuitElementToolNodeOptions = SelfOptions & VBoxOptions;

export default class CircuitElementToolNode extends InteractiveHighlighting( VBox ) {

  private readonly circuit: Circuit;
  private readonly globalToCircuitNodePoint: ( v: Vector2 ) => Vector2;
  private readonly createElement: ( v: Vector2 ) => CircuitElement;
  private readonly keyboardCreateToLeft: boolean;

  /**
   * @param circuitElementType - the type of circuit element this tool creates
   * @param labelStringProperty
   * @param pluralLabelStringProperty - plural form of the label for disabled help text (e.g., "Coins" instead of "Coin")
   * @param showLabelsProperty
   * @param viewTypeProperty
   * @param circuit
   * @param globalToCircuitNodePoint Vector2=>Vector2 global point to coordinate frame of circuitNode
   * @param iconNode
   * @param maxNumber
   * @param count - () => number, gets the number of that kind of object in the model, so the icon can be
   *                         - hidden when all items have been created
   * @param createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given position
   *                                 - for most components it is the center of the component.  For Light Bulbs, it is
   *                                 - in the center of the socket
   * @param [providedOptions]
   */
  public constructor( circuitElementType: CircuitElementType, labelStringProperty: TReadOnlyProperty<string>, pluralLabelStringProperty: TReadOnlyProperty<string>, showLabelsProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>,
                      circuit: Circuit, globalToCircuitNodePoint: ( v: Vector2 ) => Vector2, iconNode: Node, maxNumber: number,
                      count: () => number, createElement: ( v: Vector2 ) => CircuitElement, providedOptions: CircuitElementToolNodeOptions ) {

    let labelText: Node | null = null;
    if ( labelStringProperty.value.length > 0 && providedOptions && providedOptions.tandem ) {
      labelText = new Text( labelStringProperty, {
        fontSize: 12, maxWidth: TOOLBOX_ICON_WIDTH,
        fill: CCKCColors.textFillProperty,
        tandem: providedOptions.tandem.createTandem( 'labelText' ),
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      } );
      delete providedOptions.tandem;
      showLabelsProperty.linkAttribute( labelText, 'visible' );
    }
    const options = optionize<CircuitElementToolNodeOptions, SelfOptions, VBoxOptions>()( {
      spacing: 2, // Spacing between the icon and the text
      cursor: 'pointer',

      // hack because the series ammeter tool node has text rendered separately (joined with probe ammeter)
      children: labelText ? [ iconNode, labelText ] : [ iconNode ],

      // Expand touch area around text, see https://github.com/phetsims/circuit-construction-kit-dc/issues/82
      touchAreaExpansionLeft: 0,
      touchAreaExpansionTop: 0,
      touchAreaExpansionRight: 0,
      touchAreaExpansionBottom: 0,

      excludeInvisibleChildrenFromBounds: false,
      additionalProperty: new BooleanProperty( true ),

      ghostOpacity: 0.4,

      keyboardCreateToLeft: false,

      tagName: 'button',
      accessibleName: CircuitConstructionKitCommonFluent.a11y.circuitComponentToolbox.toolAccessibleName.createProperty( {
        componentName: labelStringProperty
      } ),
      accessibleHelpTextBehavior: ParallelDOM.HELP_TEXT_AFTER_CONTENT
    }, providedOptions );

    // Create disabled help text that explains why the button is disabled (all components have been added)
    const disabledHelpTextProperty = CircuitConstructionKitCommonFluent.a11y.circuitComponentToolbox.toolDisabledHelpText.createProperty( {
      componentType: pluralLabelStringProperty
    } );

    super( options );

    this.circuit = circuit;
    this.globalToCircuitNodePoint = globalToCircuitNodePoint;
    this.createElement = createElement;
    this.keyboardCreateToLeft = options.keyboardCreateToLeft;

    this.addInputListener( DragListener.createForwardingListener( ( event: PressListenerEvent ) => {

      // initial position of the pointer in the coordinate frame of the CircuitNode
      const v = event.pointer.point;
      const viewPosition = globalToCircuitNodePoint( v );

      // Adjust for touch.  The object should appear centered on the mouse but vertically above the finger so the finger
      // doesn't obscure the object
      viewPosition.y = viewPosition.y - ( event.pointer.isTouchLike() ? 28 : 0 );

      // Create the new CircuitElement at the correct position
      const circuitElement = createElement( viewPosition );

      // Add the CircuitElement to the Circuit
      circuit.circuitElements.add( circuitElement );

      // Send the start drag event through so the new element will begin dragging.
      circuitElement.startDragEmitter.emit( event );
    }, {
      allowTouchSnag: true
    } ) );

    const keyboardListener = new KeyboardListener( {
      fireOnClick: true,
      fire: () => this.createAtAvailablePosition()
    } );
    this.addInputListener( keyboardListener );

    // Make the tool icon visible if we can create more of the item. But be careful to only update visibility when
    // the specific count for this item changes, so we can support PhET-iO hiding the icons via visibility.
    let lastCount: number | null = null;
    let lastValue: boolean | null = null;

    Multilink.multilink( [ circuit.circuitElements.lengthProperty, options.additionalProperty ], ( length, existsAtAll: boolean ) => {
      const currentCount = count();
      if ( lastCount !== currentCount || lastValue !== existsAtAll ) {

        // Gray out circuit elements that cannot be dragged out
        const hasMoreAvailable = ( currentCount < maxNumber );
        this.setOpacity( hasMoreAvailable ? 1 : options.ghostOpacity );
        this.filters = hasMoreAvailable ? [] : [ Grayscale.FULL ];
        this.inputEnabled = hasMoreAvailable;

        // Show help text explaining why the button is disabled when no more components are available
        this.accessibleHelpText = hasMoreAvailable ? null : disabledHelpTextProperty.value;

        // For the non-ohmic real bulb, when it is not selected in the advanced control panel, the icon should not appear at all
        this.visible = existsAtAll;
      }
      lastCount = currentCount;
      lastValue = existsAtAll;
    } );

    // Update touch areas when lifelike/schematic changes
    const updatePointerAreas = () => {

      // Expand touch area around text, see https://github.com/phetsims/circuit-construction-kit-dc/issues/82
      this.touchArea = this.localBounds.withOffsets(
        options.touchAreaExpansionLeft,
        options.touchAreaExpansionTop,
        options.touchAreaExpansionRight,
        options.touchAreaExpansionBottom
      );
      this.mouseArea = this.touchArea;
    };
    viewTypeProperty.link( updatePointerAreas );

    this.localBoundsProperty.link( updatePointerAreas );
  }

  /**
   * Check whether a candidate center position has vertex proximity conflicts with existing vertices.
   * Returns the minimum distance from either candidate vertex to any existing vertex.
   */
  private getMinVertexDistance( center: Vector2, halfLength: number ): number {
    const candidateStart = new Vector2( center.x - halfLength, center.y );
    const candidateEnd = new Vector2( center.x + halfLength, center.y );

    let minDistance = Number.POSITIVE_INFINITY;
    for ( let i = 0; i < this.circuit.vertexGroup.count; i++ ) {
      const existingPos = this.circuit.vertexGroup.getElement( i ).positionProperty.value;
      minDistance = Math.min(
        minDistance,
        existingPos.distance( candidateStart ),
        existingPos.distance( candidateEnd )
      );
    }
    return minDistance;
  }

  /**
   * Create a circuit element at the next available position. Used by both the keyboard listener
   * and the automated test facility (window.createComponentTest).
   *
   * First attempts row-based placement near the tool icon (filling horizontally, then wrapping to
   * subsequent rows). Once the row-based area is exhausted, falls back to random placement within
   * the visible area, checking that vertices don't land on top of existing vertices.
   */
  public createAtAvailablePosition(): void {

    const HALF_LENGTH = 55; // Half the length of a placed element (~110px for resistors)
    const MIN_VERTEX_DISTANCE = 50; // Must exceed SNAP_RADIUS (30) to prevent unintended snapping
    const HORIZONTAL_SPACING = 2 * HALF_LENGTH + MIN_VERTEX_DISTANCE; // Center-to-center so adjacent vertices are MIN_VERTEX_DISTANCE apart
    const VERTICAL_SPACING = 100;

    // Hard-coded bounds in circuit-node coordinates. leftBound/rightBound are the limits for the
    // left and right vertices respectively, so the element center must be inset by HALF_LENGTH.
    const leftBound = -360;
    const rightBound = 253;
    const topBound = -288;
    const bottomBound = 288;

    // The center x must keep both vertices within bounds
    const minCenterX = leftBound + HALF_LENGTH;
    const maxCenterX = rightBound - HALF_LENGTH;

    // Use the tool icon's global position only for the starting y coordinate
    const startY = this.globalToCircuitNodePoint( this.globalBounds.center ).y;

    // Phase 1: Row-based placement near the tool icon.
    // Start from the side nearest the toolbox and fill horizontally.
    const horizontalStep = this.keyboardCreateToLeft ? -HORIZONTAL_SPACING : HORIZONTAL_SPACING;
    const startX = this.keyboardCreateToLeft ? maxCenterX : minCenterX;
    let center = new Vector2( startX, startY );

    let foundRowPosition = false;
    let iterations = 0;

    while ( iterations < 200 ) {
      iterations++;

      // Check vertex proximity at this row position
      if ( this.getMinVertexDistance( center, HALF_LENGTH ) >= MIN_VERTEX_DISTANCE ) {
        foundRowPosition = true;
        break;
      }

      // Try the next position in the current horizontal row
      const nextX = center.x + horizontalStep;

      if ( nextX >= minCenterX && nextX <= maxCenterX ) {
        center = new Vector2( nextX, center.y );
      }
      else {
        // Row is full, move to a new row below and reset X to starting position
        const nextY = center.y + VERTICAL_SPACING;

        // If we've gone below the available bounds, the row-based area is exhausted
        if ( nextY > bottomBound ) {
          break;
        }
        center = new Vector2( startX, nextY );
      }
    }

    // Phase 2: If row-based placement failed, fall back to random placement.
    if ( !foundRowPosition ) {
      const MAX_RANDOM_ATTEMPTS = 50;

      let bestCenter: Vector2 | null = null;
      let bestMinDistance = 0;

      for ( let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt++ ) {
        const x = dotRandom.nextDoubleBetween( minCenterX, maxCenterX );
        const y = dotRandom.nextDoubleBetween( topBound, bottomBound );
        const candidate = new Vector2( x, y );

        const minDist = this.getMinVertexDistance( candidate, HALF_LENGTH );

        // Track the best candidate in case all attempts have conflicts
        if ( minDist > bestMinDistance ) {
          bestMinDistance = minDist;
          bestCenter = candidate;
        }

        // Accept this position if no existing vertex is too close
        if ( minDist >= MIN_VERTEX_DISTANCE ) {
          bestCenter = candidate;
          break;
        }
      }

      // Use the best random candidate, or center of bounds as final fallback
      center = bestCenter || new Vector2( ( minCenterX + maxCenterX ) / 2, ( topBound + bottomBound ) / 2 );
    }

    const circuitElement = this.createElement( center );
    this.circuit.circuitElements.add( circuitElement );

    // Speaks its newly assigned accessibleName name on focus
    circuitElement.focusEmitter.emit();
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );