// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Named CCKLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode
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
  var Property = require( 'AXON/Property' );
  var Util = require( 'DOT/Util' );
  var Matrix3 = require( 'DOT/Matrix3' );

  /**
   *
   * @constructor
   */
  function CCKLightBulbNode( circuitConstructionKitScreenView, circuitNode, lightBulb, runningProperty, tandem, options ) {
    var self = this;
    this.lightBulb = lightBulb;
    var brightnessProperty = new Property( 0.0 );
    var updateBrightness = Property.multilink( [ lightBulb.currentProperty, runningProperty ], function( current, running ) {
      var scaled = Math.abs( current ) / 20;
      var clamped = Util.clamp( scaled, 0, 1 );

      // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
      // see https://github.com/phetsims/scenery-phet/issues/225
      if ( clamped < 1E-6 ) {
        clamped = 0;
      }
      brightnessProperty.value = running ? clamped : 0;
    } );
    this.lightBulbNode = new CustomLightBulbNode( brightnessProperty, {
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
      contentWidth: 12 * 0.3,
      contentHeight: 22 * 0.5,
      highlightOptions: {
        centerX: 0,

        // Offset the highlight vertically so it looks good, tuned manually
        bottom: FixedLengthCircuitElementNode.HIGHLIGHT_INSET * 0.75
      }
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, lightBulb, this.lightBulbNode, contentScale, tandem, options );

    // Set the initial location of the highlight, since it was not available in the supercall to updateLayout
    updateLayout( lightBulb.startVertexProperty.get().positionProperty.get(), lightBulb.endVertexProperty.get().positionProperty.get() );

    this.disposeCCKLightBulbNode = function() {
      updateBrightness.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'CCKLightBulbNode', CCKLightBulbNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbNode, {

    dispose: function() {
      this.disposeCCKLightBulbNode();
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
    },

    /**
     * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
     * @override
     */
    updateOpacityOnInteractiveChange: function() {

      // TODO: Make the light bulb images look faded out.
    }
  } );
} );