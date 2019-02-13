// Copyright 2016-2019, University of Colorado Boulder

/**
 * The curved wire between a probe and its body.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  class ProbeWireNode extends Path {
    /**
     * @param {Color|string} color - the color of the wire
     * @param {Vector2} bodyControlPointOffset - delta from the body to its control point
     * @param {Vector2} probeControlPointOffset - delta from the probe to its control point
     */
    constructor( color, bodyControlPointOffset, probeControlPointOffset ) {
      super( null, {
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


    /**
     * Update the shape of the wire when its end points have translated
     * @private
     */
    updateWireShape() {
      const bodyX = this.bodyPosition.x;
      const bodyY = this.bodyPosition.y;
      const probeX = this.probePosition.x;
      const probeY = this.probePosition.y;

      this.shape = new Shape()
        .moveTo( bodyX, bodyY )
        .cubicCurveTo(
          bodyX + this.bodyControlPointOffset.x, bodyY + this.bodyControlPointOffset.y,
          probeX + this.probeControlPointOffset.x, probeY + this.probeControlPointOffset.y,
          probeX, probeY
        );
    }

    /**
     * @param {Vector2} probePosition - the position of the part of the probe where the wire connects
     * @public
     */
    setProbePosition( probePosition ) {
      this.probePosition = probePosition;
      this.updateWireShape();
    }

    /**
     * @param {Vector2} bodyPosition - the position of the part of the meter body where the wire connects
     * @public
     */
    setBodyPosition( bodyPosition ) {
      this.bodyPosition = bodyPosition;
      this.updateWireShape();
    }
  }

  return circuitConstructionKitCommon.register( 'ProbeWireNode', ProbeWireNode );
} );