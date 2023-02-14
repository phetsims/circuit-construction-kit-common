// Copyright 2017-2023, University of Colorado Boulder

/**
 * An icon in the circuit element toolbox/carousel that can be used to create circuit elements. Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { DragListener, Grayscale, Node, PressListenerEvent, Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Multilink from '../../../axon/js/Multilink.js';
import optionize from '../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
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
};
export type CircuitElementToolNodeOptions = SelfOptions & VBoxOptions;

export default class CircuitElementToolNode extends VBox {

  /**
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
  public constructor( labelStringProperty: TReadOnlyProperty<string>, showLabelsProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>,
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

      ghostOpacity: 0.4
    }, providedOptions );

    super( options );

    this.addInputListener( DragListener.createForwardingListener( ( event: PressListenerEvent ) => {

      // initial position of the pointer in the coordinate frame of the CircuitNode
      const v: Vector2 = event.pointer.point;
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