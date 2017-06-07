// Copyright 2017, University of Colorado Boulder

/**
 * Node used by FixedLengthCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // constants
  var PADDING = 10; // in view coordinates
  var CORNER_RADIUS = 8; // in view coordinates

  /**
   * @param {FixedLengthCircuitElementNode} fixedLengthCircuitElementNode
   * @param {Object} [options]
   * @constructor
   */
  function FixedLengthCircuitElementHighlightNode( fixedLengthCircuitElementNode, options ) {

    // Use the content node dimensions but allow overriding with an option
    options = _.extend( {
      width: fixedLengthCircuitElementNode.contentNode.width,
      height: fixedLengthCircuitElementNode.contentNode.height
    }, options );

    Rectangle.call( this,
      fixedLengthCircuitElementNode.contentNode.bounds.minX - PADDING,
      fixedLengthCircuitElementNode.contentNode.bounds.minY - PADDING,
      options.width + PADDING * 2,
      options.height + PADDING * 2,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
        lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH,
        pickable: false
      } );
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElementHighlightNode', FixedLengthCircuitElementHighlightNode );

  return inherit( Rectangle, FixedLengthCircuitElementHighlightNode );
} );