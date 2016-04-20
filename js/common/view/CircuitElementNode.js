// Copyright 2015-2016, University of Colorado Boulder

/**
 * Abstract base class for CircuitElementNode and FixedLengthCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditContainerPanel' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementNode( circuitElement, options ) {
    Node.call( this, options );
    this.circuitElement = circuitElement;
  }

  return inherit( Node, CircuitElementNode, {
    createDeselectFunctionListener: function( circuitNode ) {
      var deselect = function( event ) {

        // Detect whether the user is hitting something pickable in the CircuitElementEditContainerPanel
        var circuitElementEditContainerPanel = false;
        for ( var i = 0; i < event.trail.nodes.length; i++ ) {
          var trailNode = event.trail.nodes[ i ];
          if ( trailNode instanceof CircuitElementEditContainerPanel ) {
            circuitElementEditContainerPanel = true;
          }
        }

        // If the user clicked outside of the CircuitElementEditContainerPanel, then hide the edit panel and
        // deselect the circuitElement
        if ( !circuitElementEditContainerPanel ) {
          circuitNode.circuit.selectedCircuitElementProperty.set( null );
          event.pointer.removeInputListener( listener ); // Thanks, hoisting!
        }
      };
      var listener = {
        mouseup: deselect,
        touchup: deselect
      };
      return listener;
    },
    maybeSelect: function( event, circuitNode, p ) {

      if ( event.pointer.point.distance( p ) < CircuitConstructionKitBasicsConstants.tapThreshold ) {

        circuitNode.circuit.selectedCircuitElementProperty.set( this.circuitElement );

        // When the user clicks on anything else, deselect the vertex
        event.pointer.addInputListener( this.createDeselectFunctionListener( circuitNode ) );
      }
    }
  } );
} );