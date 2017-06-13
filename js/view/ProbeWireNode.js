// Copyright 2016, University of Colorado Boulder

/**
 * The wire between a probe and its body.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Color|string} color - the color of the wire
   * @param {Vector2} bodyControlPointOffset - delta from the body to its control point
   * @param {Vector2} probeControlPointOffset - delta from the probe to its control point
   * @constructor
   */
  function ProbeWireNode( color, bodyControlPointOffset, probeControlPointOffset ) {
    Path.call( this, null, {
      lineWidth: 3,
      stroke: color
    } );
    var self = this;

    // @private {Vector2}
    this.probePosition = new Vector2();

    // @private {Vector2}
    this.bodyPosition = new Vector2();

    // @private {function}
    this.updateWireShape = function() {

      var bodyX = self.bodyPosition.x;
      var bodyY = self.bodyPosition.y;
      var probeX = self.probePosition.x;
      var probeY = self.probePosition.y;

      self.shape = new Shape()
        .moveTo( bodyX, bodyY )
        .cubicCurveTo(
          bodyX + bodyControlPointOffset.x, bodyY + bodyControlPointOffset.y,
          probeX + probeControlPointOffset.x, probeY + probeControlPointOffset.y,
          probeX, probeY
        );
    };

    this.updateWireShape();
  }

  circuitConstructionKitCommon.register( 'ProbeWireNode', ProbeWireNode );

  return inherit( Path, ProbeWireNode, {

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