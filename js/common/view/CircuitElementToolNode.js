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
          circuitElement.startDragEmitter.emit1( event );
        }
      }
    );

    circuit.circuitElements.lengthProperty.link( function() {
      debugger;
      self.visible = count() < maxNumber;
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolNode', CircuitElementToolNode );

  return inherit( Node, CircuitElementToolNode );
} );