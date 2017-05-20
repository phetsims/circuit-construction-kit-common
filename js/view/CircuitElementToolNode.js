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
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // constants
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitConstants.TOOLBOX_ICON_SIZE;

  /**
   * @param {string} labelText
   * @param {BooleanProperty} showLabelsProperty
   * @param {CircuitNode} circuitNode
   * @param {Node} iconNode
   * @param {number} maxNumber
   * @param {function} count
   * @param {function} createElement
   * @constructor
   */
  function CircuitElementToolNode( labelText, showLabelsProperty, circuitNode, iconNode, maxNumber, count, createElement ) {
    var circuit = circuitNode.circuit;
    var self = this;
    var labelNode = new Text( labelText, { fontSize: 12, maxWidth: TOOLBOX_ICON_SIZE } ); // TODO: constrain width
    showLabelsProperty.link( function( showLabels ) {labelNode.visible = showLabels;} );
    VBox.call( this, {
      spacing: 6,
      resize: false,
      cursor: 'pointer',
      children: labelText.length > 0 ? [ iconNode, labelNode ] : [ iconNode ] // hack because the series ammeter tool node has text rendered separately (joined with probe ammeter)
    } );

    this.addInputListener( {
        down: function( event ) {

          // Ignore non-left-mouse-button, see #64
          if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
            return;
          }

          // initial position of the pointer in the coordinate frame of the CircuitNode
          var viewPosition = circuitNode.globalToLocalPoint( event.pointer.point );

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
        }
      }
    );

    circuit.circuitElements.lengthProperty.link( function() {
      self.visible = count() < maxNumber;
    } );

    // Expand touch area around text
    this.touchArea = this.localBounds.dilated( 10 );
    this.mouseArea = this.touchArea;
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );

  return inherit( VBox, CircuitElementToolNode );
} );