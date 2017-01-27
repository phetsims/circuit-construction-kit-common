// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @constructor
   */
  function CircuitElementToolNode( iconNode, circuit, circuitElementToolbox, maxNumber, count, createElement ) {
    var self = this;
    Node.call( this, { children: [ iconNode ] } );

    this.addInputListener( {
        down: function( event ) {

          // Ignore non-left-mouse-button, see #64
          if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
            return;
          }

          // initial position of the pointer in the screenView coordinates
          var viewPosition = circuitElementToolbox.globalToParentPoint( event.pointer.point );

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
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );

  return inherit( Node, CircuitElementToolNode );
} );