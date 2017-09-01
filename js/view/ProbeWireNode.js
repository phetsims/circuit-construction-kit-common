// Copyright 2016-2017, University of Colorado Boulder

/**
 * The curved wire between a probe and its body.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   * @param {Color|string} color - the color of the wire
   * @param {Vector2} bodyControlPointOffset - delta from the body to its control point
   * @param {Vector2} probeControlPointOffset - delta from the probe to its control point
   * @constructor
   */
  function ProbeWireNode( color, bodyControlPointOffset, probeControlPointOffset ) {
    Path.call( this, null, {
      lineWidth: 3,
      stroke: color,
      pickable: false
    } );

    // @private {Vector2}
    this.probePosition = new Vector2();

    // @private {Vector2}
    this.bodyPosition = new Vector2();

    // @private {Vector2}
    this.bodyControlPointOffset = bodyControlPointOffset;

    // @private {Vector2}
    this.probeControlPointOffset = probeControlPointOffset;

    // set correct initial shape
    this.updateWireShape();
  }

  circuitConstructionKitCommon.register( 'ProbeWireNode', ProbeWireNode );

  return inherit( Path, ProbeWireNode, {

    /**
     * Update the shape of the wire when its end points have translated
     * @private
     */
    updateWireShape: function() {
      var bodyX = this.bodyPosition.x;
      var bodyY = this.bodyPosition.y;
      var probeX = this.probePosition.x;
      var probeY = this.probePosition.y;

      this.shape = new Shape()
        .moveTo( bodyX, bodyY )
        .cubicCurveTo(
          bodyX + this.bodyControlPointOffset.x, bodyY + this.bodyControlPointOffset.y,
          probeX + this.probeControlPointOffset.x, probeY + this.probeControlPointOffset.y,
          probeX, probeY
        );
    },

    /**
     * @param {Vector2} probePosition - the position of the part of the probe where the wire connects
     * @public
     */
    setProbePosition: function( probePosition ) {
      this.probePosition = probePosition;
      this.updateWireShape();
    },

    /**
     * @param {Vector2} bodyPosition - the position of the part of the meter body where the wire connects
     * @public
     */
    setBodyPosition: function( bodyPosition ) {
      this.bodyPosition = bodyPosition;
      this.updateWireShape();
    }
  } );
} );