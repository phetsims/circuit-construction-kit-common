// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  function ProbeWireNode( color, controlPointDelta1, controlPointDelta2 ) {
    Path.call( this, null, {
      lineWidth: 3,
      stroke: color
    } );
    var probeWireNode = this;
    this.probePosition = new Vector2();
    this.bodyPosition = new Vector2();

    this.updateWireShape = function() {

      var bodyX = probeWireNode.bodyPosition.x;
      var bodyY = probeWireNode.bodyPosition.y;
      var probeX = probeWireNode.probePosition.x;
      var probeY = probeWireNode.probePosition.y;

      probeWireNode.shape = new Shape()
        .moveTo( bodyX, bodyY )
        .cubicCurveTo(
          bodyX + controlPointDelta1.x, bodyY + controlPointDelta1.y,
          probeX + controlPointDelta2.x, probeY + controlPointDelta2.y,
          probeX, probeY
        );
    };

    this.updateWireShape();
  }

  circuitConstructionKit.register( 'ProbeWireNode', ProbeWireNode );

  return inherit( Path, ProbeWireNode, {

    /**
     * @param {Vector2} probePosition
     */
    setProbePosition: function( probePosition ) {
      this.probePosition = probePosition;
      this.updateWireShape();
    },

    /**
     * @param {Vector2} bodyPosition
     */
    setBodyPosition: function( bodyPosition ) {
      this.bodyPosition = bodyPosition;
      this.updateWireShape();
    }
  } );
} );