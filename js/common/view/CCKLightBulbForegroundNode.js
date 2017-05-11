// Copyright 2015-2017, University of Colorado Boulder

/**
 * Shows the socket (base) of the light bulb only, so that it will appear that the electrons go "inside" the base.
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

  // TODO: Factor out this matrix logic, it seems to be used in many places.
  var contentScale = 2.5;
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
  function CCKLightBulbForegroundNode( circuitConstructionKitScreenView, circuitNode, lightBulb, runningProperty, viewProperty, tandem, options ) {
    // TODO: factor out duplicated code between this class and CCKLightBulbNode

    // TODO: This is overkill, we should just have an Image, without all of the extra brightness lines, etc.
    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      scale: 3.5
    } );

    options = _.extend( {

      // Override the dimensions of the bulb node because the invisible rays contribute to the bounds.
      contentWidth: 12 * 0.2,
      contentHeight: 22 * 0.5,

      // Interferes with Cut Button selection when the foreground is in front, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
      pickable: false,
      highlightOptions: {
        centerX: 0,

        // Offset the highlight vertically so it looks good, tuned manually
        bottom: FixedLengthCircuitElementNode.HIGHLIGHT_INSET * 0.75
      }
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, lightBulb, viewProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ), tandem, options );
  }

  circuitConstructionKitCommon.register( 'CCKLightBulbForegroundNode', CCKLightBulbForegroundNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbForegroundNode, {

    /**
     * @override
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var angle = endPosition.minus( startPosition ).angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
        .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
        .multiplyMatrix( scratchMatrix2.setToScale( contentScale ) );
      this.contentNode.setMatrix( scratchMatrix );

      self.highlightParent && self.highlightParent.setMatrix( scratchMatrix.copy() );
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