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
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CCKMathUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKMathUtil' );

  // constants
  var SCRATCH_MATRIX = new Matrix3();

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CCKScreenView} circuitConstructionKitScreenView - the main screen view
   * @param {CircuitNode} circuitNode - the node for the entire circuit
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<boolean>} runningProperty - true if the sim can display values
   * @param {Property.<string>} viewProperty - 'likelike'|'schematic'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function LightBulbSocketNode( circuitConstructionKitScreenView, circuitNode, lightBulb, runningProperty, viewProperty, tandem, options ) {
    // TODO: factor out duplicated code between this class and CCKLightBulbNode

    // TODO: This is overkill, we should just have an Image, without all of the extra brightness lines, etc.
    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      scale: CircuitConstructionKitConstants.BULB_SCALE
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

    // Suppress the highlight for the socket, the highlight is shown for the CCKLightBulbNode
    if ( this.highlightNode ) {
      this.highlightNode.stroke = null;
    }
  }

  circuitConstructionKitCommon.register( 'LightBulbSocketNode', LightBulbSocketNode );

  return inherit( FixedLengthCircuitElementNode, LightBulbSocketNode, {

    /**
     * @override
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var angle = endPosition.minus( startPosition ).angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      CCKMathUtil.setToTranslationRotation( SCRATCH_MATRIX, startPosition, angle );
      this.contentNode.setMatrix( SCRATCH_MATRIX );
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