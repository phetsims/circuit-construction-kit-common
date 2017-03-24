// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Shows the foreground of the light bulb, so that charges are depicted in the correct z-order (through the base)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementNode' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CustomLightBulbNode' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   *
   * @constructor
   */
  function CCKLightBulbForegroundNode( circuitConstructionKitScreenView, circuitNode, lightBulb, runningProperty, viewProperty, tandem, options ) {
    var self = this;
    this.lightBulb = lightBulb;

    // TODO: This is overkill, we should just have an Image, without all of the extra brightness lines, etc.
    this.lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      scale: 3.5
    } );
    var contentScale = 2.5;
    var scratchMatrix = new Matrix3();
    var scratchMatrix2 = new Matrix3();
    var updateLayout = function( startPosition, endPosition ) {
      var angle = endPosition.minus( startPosition ).angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
        .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
        .multiplyMatrix( scratchMatrix2.setToScale( contentScale ) );
      self.lightBulbNode.setMatrix( scratchMatrix );

      self.highlightParent && self.highlightParent.setMatrix( scratchMatrix.copy() );
    };
    options = _.extend( {
      updateLayout: updateLayout,

      // Override the dimensions of the bulb node because the invisible rays contribute to the bounds.
      contentWidth: 12 * 0.2,
      contentHeight: 22 * 0.5,
      highlightOptions: {
        centerX: 0,

        // Offset the highlight vertically so it looks good, tuned manually
        bottom: FixedLengthCircuitElementNode.HIGHLIGHT_INSET * 0.75
      }
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, lightBulb, viewProperty, this.lightBulbNode, new Rectangle( 0, 0, 10, 10 ), contentScale, tandem, options );

    // Set the initial location of the highlight, since it was not available in the supercall to updateLayout
    updateLayout( lightBulb.startVertexProperty.get().positionProperty.get(), lightBulb.endVertexProperty.get().positionProperty.get() );

    // Interferes with Cut Button selection when the foreground is in front, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    this.pickable = false;
  }

  circuitConstructionKitCommon.register( 'CCKLightBulbForegroundNode', CCKLightBulbForegroundNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbForegroundNode, {

    /**
     * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
     * @override
     */
    updateOpacityOnInteractiveChange: function() {

      // TODO: Make the light bulb images look faded out.
    }
  } );
} );