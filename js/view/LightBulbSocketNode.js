// Copyright 2015-2017, University of Colorado Boulder

/**
 * Shows the socket (base) of the light bulb only, so that it will appear that the charges go "inside" the base.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NumberProperty = require( 'AXON/NumberProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var SCRATCH_MATRIX = new Matrix3();

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function LightBulbSocketNode( circuitConstructionKitScreenView, circuitLayerNode, lightBulb, viewTypeProperty, tandem, options ) {

    // Render the bulb socket only
    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      highResistance: lightBulb.highResistance,
      scale: CircuitConstructionKitCommonConstants.BULB_SCALE
    } );

    // Interferes with Cut Button selection when the foreground is in front, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    options = _.extend( {
      pickable: false
    }, options );
    FixedCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitLayerNode, lightBulb,
      viewTypeProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ), tandem, options );

    // Suppress the highlight for the socket, the highlight is shown by the CircuitConstructionKitLightBulbNode
    //REVIEW*: Would a super option to omit the highlight work?
    if ( this.highlightNode ) {
      this.highlightNode.stroke = null;
    }
  }

  circuitConstructionKitCommon.register( 'LightBulbSocketNode', LightBulbSocketNode );

  return inherit( FixedCircuitElementNode, LightBulbSocketNode, {

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @override
     * @protected - CircuitConstructionKitLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startPositionProperty.get();
      var endPosition = this.circuitElement.endPositionProperty.get();
      var angle = endPosition.minus( startPosition ).angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      this.contentNode.setMatrix( SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle ) );
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