// Copyright 2017-2020, University of Colorado Boulder

/**
 * An icon in the circuit element toolbox/carousel that can be used to create circuit elements. Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import SimpleDragHandler from '../../../scenery/js/input/SimpleDragHandler.js';
import Touch from '../../../scenery/js/input/Touch.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const TOOLBOX_ICON_SIZE = CCKCConstants.TOOLBOX_ICON_SIZE;

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
    const labelNode = new Text( labelText, { fontSize: 12, maxWidth: TOOLBOX_ICON_SIZE } );
    showLabelsProperty.linkAttribute( labelNode, 'visible' );
    options = merge( {
      spacing: 6, // Spacing between the icon and the text
      cursor: 'pointer',

      // hack because the series ammeter tool node has text rendered separately (joined with probe ammeter)
      children: labelText.length > 0 ? [ iconNode, labelNode ] : [ iconNode ],

      // Expand touch area around text, see https://github.com/phetsims/circuit-construction-kit-dc/issues/82
      touchAreaExpansionLeft: 10,
      touchAreaExpansionTop: 13,
      touchAreaExpansionRight: 10,
      touchAreaExpansionBottom: 3,

      excludeInvisibleChildrenFromBounds: false
    }, options );
    super( options );

    this.addInputListener( SimpleDragHandler.createForwardingListener( event => {

      // initial position of the pointer in the coordinate frame of the CircuitLayerNode
      const viewPosition = globalToCircuitLayerNodePoint( event.pointer.point );

      // Adjust for touch.  The object should appear centered on the mouse but vertically above the finger so the finger
      // doesn't obscure the object
      viewPosition.y = viewPosition.y - ( event.pointer instanceof Touch ? 28 : 0 );

      // Create the new CircuitElement at the correct position
      const circuitElement = createElement( viewPosition, event );

      // Add the CircuitElement to the Circuit
      circuit.circuitElements.add( circuitElement );

      // Send the start drag event through so the new element will begin dragging.
      // From: https://github.com/phetsims/scenery-phet/issues/195#issuecomment-186300071
      // @jonathanolson and I looked into the way Charges and Fields just calls startDrag(event) on the play area drag
      // listener (which adds a listener to the pointer, in the usual SimpleDragHandler way), and it seems like a good
      // pattern.
      circuitElement.startDragEmitter.emit( event );
    }, {
      allowTouchSnag: true
    } ) );

    circuit.circuitElements.lengthProperty.link( () => this.setVisible( count() < maxNumber ) );

    // Update touch areas when lifelike/schematic changes
    viewTypeProperty.link( () => {

      // Expand touch area around text, see https://github.com/phetsims/circuit-construction-kit-dc/issues/82
      this.touchArea = this.localBounds.withOffsets(
        options.touchAreaExpansionLeft,
        options.touchAreaExpansionTop,
        options.touchAreaExpansionRight,
        options.touchAreaExpansionBottom
      );
      this.mouseArea = this.touchArea;
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );
export default CircuitElementToolNode;
