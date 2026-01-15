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

  // When true, keyboard-created elements appear to the left of the tool icon instead of the right.
  // Useful for toolboxes on the right side of the screen.
  keyboardCreateToLeft?: boolean;
};
export type CircuitElementToolNodeOptions = SelfOptions & VBoxOptions;

export default class CircuitElementToolNode extends InteractiveHighlighting( VBox ) {

  /**
   * @param circuitElementType - the type of circuit element this tool creates
   * @param labelStringProperty
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
  public constructor( circuitElementType: CircuitElementType, labelStringProperty: TReadOnlyProperty<string>, showLabelsProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>,
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
      } )
    }, providedOptions );

    super( options );

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
      fire: () => {

        // Position the element to the left or right of the tool icon depending on the option.
        // Toolboxes on the right side of the screen should create elements to the left.
        let center = options.keyboardCreateToLeft ?
                     globalToCircuitNodePoint( this.globalBounds.leftCenter ).plusXY( -300, 0 ) : // tool is far from edge of panel
                     globalToCircuitNodePoint( this.globalBounds.rightCenter ).plusXY( 100, 0 ); // tool is close to edge of panel

        // Bounds for random positioning if nearby search fails
        const minX = -512;
        const maxX = 512;
        const minY = -326;
        const maxY = 326;

        // Keep trying to find a position that doesn't overlap with existing elements
        let hasCollision = true;
        let count = 0;
        const NEARBY_SEARCH_ATTEMPTS = 20; // Try nearby positions first

        while ( hasCollision && count < 100 ) { // safety to prevent infinite loop
          hasCollision = false;
          count++;

          for ( const element of circuit.circuitElements ) {
            const otherCenter = element.startPositionProperty.value.average( element.endPositionProperty.value );

            if ( center.distance( otherCenter ) < 150 ) {
              hasCollision = true;

              // For the first several attempts, try shifting in the preferred direction (nearby search)
              const shiftDirection = options.keyboardCreateToLeft ? -150 : 150;
              const inBounds = options.keyboardCreateToLeft ? center.x - 150 >= minX : center.x + 150 <= maxX;
              if ( count <= NEARBY_SEARCH_ATTEMPTS && inBounds ) {
                center = center.plusXY( shiftDirection, 0 );
              }
              else {
                // After nearby search fails or goes out of bounds, try random positions within bounds
                center = new Vector2(
                  minX + dotRandom.nextDouble() * ( maxX - minX ),
                  minY + dotRandom.nextDouble() * ( maxY - minY )
                );
              }
              break; // Restart collision check from the beginning with new position
            }
          }
        }

        const circuitElement = createElement( center );
        circuit.circuitElements.add( circuitElement );

        // Speaks its newly assigned accessibleName name on focus
        circuitElement.focusEmitter.emit();
      }
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
}

circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );