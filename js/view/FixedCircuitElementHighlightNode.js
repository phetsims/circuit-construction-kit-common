// Copyright 2017, University of Colorado Boulder

/**
 * Node used by FixedCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  const PADDING = 10; // in view coordinates
  const CORNER_RADIUS = 8; // in view coordinates

  /**
   * @param {FixedCircuitElementNode} fixedCircuitElementNode
   * @constructor
   */
  function FixedCircuitElementHighlightNode( fixedCircuitElementNode ) {

    Rectangle.call( this, 0, 0, 0, 0,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: CCKCConstants.HIGHLIGHT_COLOR,
        lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
        pickable: false
      } );

    this.recomputeBounds( fixedCircuitElementNode );
  }

  circuitConstructionKitCommon.register( 'FixedCircuitElementHighlightNode', FixedCircuitElementHighlightNode );

  return inherit( Rectangle, FixedCircuitElementHighlightNode, {

    /**
     * Update the dimensions of the highlight, called on startup and when components change from lifelike/schematic.
     * @param {FixedCircuitElementNode} fixedCircuitElementNode
     * @public
     */
    recomputeBounds: function( fixedCircuitElementNode ) {

      // This is called rarely and hence the extra allocation is OK
      this.setRectBounds( fixedCircuitElementNode.contentNode.localBounds.dilated( PADDING ) );
    }
  } );
} );