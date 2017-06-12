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
  var CCKUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKUtil' );

  // constants
  var SCRATCH_MATRIX = new Matrix3();

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CCKScreenView} circuitConstructionKitScreenView - the main screen view
   * @param {CircuitLayerNode} circuitLayerNode - the node for the entire circuit
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<boolean>} showResultsProperty - true if the sim can display values
   * @param {Property.<string>} viewProperty - 'likelike'|'schematic'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function LightBulbSocketNode( circuitConstructionKitScreenView, circuitLayerNode, lightBulb, showResultsProperty, viewProperty, tandem, options ) {

    // Render the bulb socket only
    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      highResistance: lightBulb.highResistance,
      scale: CircuitConstructionKitConstants.BULB_SCALE
    } );

    // Interferes with Cut Button selection when the foreground is in front, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    options = _.extend( {
      pickable: false
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitLayerNode, lightBulb,
      viewProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ), tandem, options );

    // Suppress the highlight for the socket, the highlight is shown by the CCKLightBulbNode
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
      CCKUtil.setToTranslationRotation( SCRATCH_MATRIX, startPosition, angle );
      this.contentNode.setMatrix( SCRATCH_MATRIX );
    },

    /**
     * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
     * @override
     * @public
     */
    updateOpacityOnInteractiveChange: function() {

      // TODO (black-box-study): Make the light bulb images look faded out.
    }
  } );
} );