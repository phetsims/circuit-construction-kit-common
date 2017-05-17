// Copyright 2015-2017, University of Colorado Boulder

/**
 * Named CCKLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode.  Renders the bulb shape and brightness
 * lines.  Note that the socket is rendered in LightBulbSocketNode.
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
  var Matrix3 = require( 'DOT/Matrix3' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // images
  var fireImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  var contentScale = 1 * 0.72;
  var scratchMatrix = new Matrix3();
  var scratchMatrix2 = new Matrix3();

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView - the main screen view
   * @param {CircuitNode} circuitNode - the node for the entire circuit
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<boolean>} runningProperty - true if the sim can display values
   * @param {Property.<string>} viewProperty - 'likelike'|'schematic'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CCKLightBulbNode( circuitConstructionKitScreenView, circuitNode, lightBulb, runningProperty, viewProperty, tandem, options ) {
    var brightnessProperty = new NumberProperty( 0 );
    var updateBrightness = Property.multilink( [ lightBulb.currentProperty, runningProperty, lightBulb.voltageDifferenceProperty ], function( current, running, voltageDifference ) {
      var power = Math.abs( current * voltageDifference );

      // Heuristics are from Java
      var maxPower = 60;

      // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
      // see https://github.com/phetsims/scenery-phet/issues/225
      var minPower = 1E-6;
      power = Math.min( power, maxPower * 15 );
      power = Math.max( power, minPower );
      var brightness = Math.pow( power / maxPower, 0.354 ) * 0.4;
      brightnessProperty.value = Util.clamp( brightness, 0, 1 );
    } );
    var lightBulbNode = new CustomLightBulbNode( brightnessProperty, {
      scale: 3.5
    } );

    options = _.extend( {

      // Override the dimensions of the bulb node because the invisible rays contribute to the bounds.
      contentWidth: 12 * 0.3,
      contentHeight: 22 * 0.5,
      highlightOptions: {
        centerX: 0,
        stroke: null, // No stroke to be shown for the bulb (it is shown for the corresponding foreground node)

        // Offset the highlight vertically so it looks good, tuned manually
        bottom: FixedLengthCircuitElementNode.HIGHLIGHT_INSET * 0.75
      }
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, lightBulb, viewProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ), tandem, options );

    this.disposeCCKLightBulbNode = function() {
      updateBrightness.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'CCKLightBulbNode', CCKLightBulbNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbNode, {

    /**
     * @override
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var delta = endPosition.minus( startPosition );
      var angle = delta.angle() + Math.PI / 4;

      // TODO: factor out matrix logic
      // Update the node transform in a single step, see #66
      scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
        .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
        .multiplyMatrix( scratchMatrix2.setToScale( contentScale ) );
      this.contentNode.setMatrix( scratchMatrix );

      this.highlightNode && this.highlightNode.setMatrix( scratchMatrix.copy() );

      // Update the fire transform
      scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
        .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
        .multiplyMatrix( scratchMatrix2.setToScale( contentScale / 12 ) )
        .multiplyMatrix( scratchMatrix2.setToTranslation( -100, -fireImage[ 0 ].height - 350 ) );
      this.fireNode && this.fireNode.setMatrix( scratchMatrix.copy() );
    },
    /**
     * Dispose when no longer used.
     * @public
     */
    dispose: function() {
      this.disposeCCKLightBulbNode();
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
    },

    /**
     * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
     * @override
     * @public
     */
    updateOpacityOnInteractiveChange: function() {

      // TODO: Make the light bulb images look faded out.
    }
  } );
} );