// Copyright 2017, University of Colorado Boulder
// TODO: docs and resize when lifelike/schematic changes

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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // constants
  var INSET = 10;
  var CORNER_RADIUS = 8;

  /**
   * @constructor
   */
  function FixedLengthCircuitElementHighlightNode( fixedLengthCircuitElementNode, options ) {

    var contentNode = fixedLengthCircuitElementNode.contentNode;

    var w = options.contentWidth || contentNode.width;
    var h = options.contentHeight || contentNode.height;
    Rectangle.call( this,
      contentNode.bounds.minX - INSET,
      contentNode.bounds.minY - INSET,
      w + INSET * 2,
      h + INSET * 2,
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