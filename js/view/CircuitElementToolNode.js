// Copyright 2017, University of Colorado Boulder

/**
 * An icon in the circuit element toolbox/carousel that can be used to create circuit elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitCommonConstants.TOOLBOX_ICON_SIZE;

  /**
   * @param {string} labelText
   * @param {BooleanProperty} showLabelsProperty
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Node} iconNode
   * @param {number} maxNumber
   * @param {function} count - () => number, gets the number of that kind of object in the model, so the icon can be
   *                         - hidden when all items have been created
   * @param {function} createElement - (Vector2) => CircuitElement
   * @constructor
   */
  function CircuitElementToolNode( labelText, showLabelsProperty, circuitLayerNode, iconNode, maxNumber, count, createElement ) {
    var circuit = circuitLayerNode.circuit;
    var self = this;
    var labelNode = new Text( labelText, { fontSize: 12, maxWidth: TOOLBOX_ICON_SIZE } );
    showLabelsProperty.link( function( showLabels ) {labelNode.visible = showLabels;} );
    VBox.call( this, {
      spacing: 6, // Spacing between the icon and the text
      resize: false,
      cursor: 'pointer',

      // hack because the series ammeter tool node has text rendered separately (joined with probe ammeter)
      children: labelText.length > 0 ? [ iconNode, labelNode ] : [ iconNode ]
    } );

    this.addInputListener( SimpleDragHandler.createForwardingListener( function( event ) {

      // initial position of the pointer in the coordinate frame of the CircuitLayerNode
      var viewPosition = circuitLayerNode.globalToLocalPoint( event.pointer.point );

      // Create the new CircuitElement at the correct location
      var circuitElement = createElement( viewPosition );

      // Add the CircuitElement to the Circuit
      circuit.circuitElements.add( circuitElement );

      // Send the start drag event through so the new element will begin dragging.
      // From: https://github.com/phetsims/scenery-phet/issues/195#issuecomment-186300071
      // @jonathanolson and I looked into the way Charges and Fields just calls startDrag(event) on the play area drag
      // listener (which adds a listener to the pointer, in the usual SimpleDragHandler way), and it seems like a good
      // pattern.
      circuitElement.startDragEmitter.emit1( event );
    }, {
      allowTouchSnag: true
    } ) );

    circuit.circuitElements.lengthProperty.link( function() {
      self.visible = count() < maxNumber;
    } );

    // Expand touch area around text, see https://github.com/phetsims/circuit-construction-kit-dc/issues/82
    var touchExpansionWidth = 10;
    this.touchArea = new Bounds2(
      this.localBounds.minX - touchExpansionWidth,
      this.localBounds.minY - 13,
      this.localBounds.maxX + touchExpansionWidth,
      this.localBounds.maxY + 3
    );
    this.mouseArea = this.touchArea;
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );

  return inherit( VBox, CircuitElementToolNode );
} );