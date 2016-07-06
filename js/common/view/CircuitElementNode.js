// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Abstract base class for CircuitElementNode and FixedLengthCircuitElementNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementEditContainerPanel' );

  /**
   * @param {CircuitElement} circuitElement
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementNode( circuitElement, options ) {
    Node.call( this, options );
    this.circuitElement = circuitElement;
    this.updateOpacityOnInteractiveChange();
  }

  circuitConstructionKitCommon.register( 'CircuitElementNode', CircuitElementNode );

  return inherit( Node, CircuitElementNode, {

    // @protected
    updateOpacityOnInteractiveChange: function() {
      var circuitElementNode = this;
      // TODO: Replace this with grayscale if we keep it
      this.circuitElement.interactiveProperty.link( function( interactive ) {
        circuitElementNode.opacity = interactive ? 1 : 0.5;
      } );
    },
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

      if ( event.pointer.point.distance( p ) < CircuitConstructionKitConstants.tapThreshold ) {

        circuitNode.circuit.selectedCircuitElementProperty.set( this.circuitElement );

        // When the user clicks on anything else, deselect the vertex
        event.pointer.addInputListener( this.createDeselectFunctionListener( circuitNode ) );
      }
    }
  } );
} );