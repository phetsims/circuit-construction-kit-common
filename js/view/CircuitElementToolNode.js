// Copyright 2017-2020, University of Colorado Boulder

/**
 * An icon in the circuit element toolbox/carousel that can be used to create circuit elements. Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import merge from '../../../phet-core/js/merge.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const TOOLBOX_ICON_WIDTH = CCKCConstants.TOOLBOX_ICON_WIDTH;

class CircuitElementToolNode extends VBox {

  /**
   * @param {string} labelText
   * @param {BooleanProperty} showLabelsProperty
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Circuit} circuit
   * @param {function} globalToCircuitLayerNodePoint Vector2=>Vector2 global point to coordinate frame of circuitLayerNode
   * @param {Node} iconNode
   * @param {number} maxNumber
   * @param {function} count - () => number, gets the number of that kind of object in the model, so the icon can be
   *                         - hidden when all items have been created
   * @param {function} createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given position
   *                                 - for most components it is the center of the component.  For Light Bulbs, it is
   *                                 - in the center of the socket
   * @param {Object} [options]
   */
  constructor( labelText, showLabelsProperty, viewTypeProperty, circuit, globalToCircuitLayerNodePoint, iconNode, maxNumber, count, createElement, options ) {
    const labelNode = new Text( labelText, { fontSize: 12, maxWidth: TOOLBOX_ICON_WIDTH } );
    showLabelsProperty.linkAttribute( labelNode, 'visible' );
    options = merge( {
      spacing: 2, // Spacing between the icon and the text
      cursor: 'pointer',

      // hack because the series ammeter tool node has text rendered separately (joined with probe ammeter)
      children: labelText.length > 0 ? [ iconNode, labelNode ] : [ iconNode ],

      // Expand touch area around text, see https://github.com/phetsims/circuit-construction-kit-dc/issues/82
      touchAreaExpansionLeft: 0,
      touchAreaExpansionTop: 0,
      touchAreaExpansionRight: 0,
      touchAreaExpansionBottom: 0,

      excludeInvisibleChildrenFromBounds: false,
      additionalProperty: new BooleanProperty( true )
    }, options );
    super( options );

    this.addInputListener( DragListener.createForwardingListener( event => {

      // initial position of the pointer in the coordinate frame of the CircuitLayerNode
      const viewPosition = globalToCircuitLayerNodePoint( event.pointer.point );

      // Adjust for touch.  The object should appear centered on the mouse but vertically above the finger so the finger
      // doesn't obscure the object
      viewPosition.y = viewPosition.y - ( event.pointer.isTouchLike() ? 28 : 0 );

      // Create the new CircuitElement at the correct position
      const circuitElement = createElement( viewPosition, event );

      // Add the CircuitElement to the Circuit
      circuit.circuitElements.add( circuitElement );

      // Send the start drag event through so the new element will begin dragging.
      circuitElement.startDragEmitter.emit( event );
    }, {
      allowTouchSnag: true
    } ) );

    // Make the tool icon visible if we can create more of the item. But be careful to only update visibility when
    // the specific count for this item changes, so we can support PhET-iO hiding the icons via visibility.
    let lastCount = null;
    let lastValue = null;

    Property.multilink( [ circuit.circuitElements.lengthProperty, options.additionalProperty ], ( length, additionalValue ) => {
      const currentCount = count();
      if ( lastCount !== currentCount || lastValue !== additionalValue ) {
        this.setVisible( ( currentCount < maxNumber ) && additionalValue );
      }
      lastCount = currentCount;
      lastValue = additionalValue;
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
export default CircuitElementToolNode;
