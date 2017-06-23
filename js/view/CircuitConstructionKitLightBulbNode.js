// Copyright 2015-2017, University of Colorado Boulder

/**
 * Named CircuitConstructionKitLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode. Renders the bulb shape and brightness
 * lines. Note that the socket is rendered in LightBulbSocketNode.
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
  var Property = require( 'AXON/Property' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var LightBulbSocketNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/LightBulbSocketNode' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );

  // images
  var fireImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  var SCRATCH_MATRIX = new Matrix3();
  var SCRATCH_MATRIX_2 = new Matrix3();

  // The height from the vertex to the center of the light bulb schematic circle
  var LEAD_Y = -73;

  // The "blip" in the filament that looks like an upside down "u" semicircle
  var INNER_RADIUS = 5;

  // According to design the right lead of the vertex should be slightly offset from the center of the vertex.
  var RIGHT_OFFSET = 2;

  // This is referring to the offset from the center of the leftmost vertex because the origin must be left-centered.
  var LEFT_LEAD_X = -5;

  /**
   * Determine the brightness for a given power
   * @param {number} multiplier - steepness of the function
   * @param {number} power - the power through the light bulb
   * @returns {number}
   */
  function toBrightness( multiplier, power ) {
    var maximumBrightness = 1;

    // power at which the the brightness becomes 1
    var maximumPower = 2000;
    return Math.log( 1 + power * multiplier ) * maximumBrightness / Math.log( 1 + maximumPower * multiplier );
  }

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView - the main screen view
   * @param {CircuitLayerNode} circuitLayerNode - the node for the entire circuit
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<boolean>} showResultsProperty - true if the sim can display values
   * @param {Property.<string>} viewProperty - 'likelike'|'schematic'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitLightBulbNode( circuitConstructionKitScreenView, circuitLayerNode, lightBulb, showResultsProperty, viewProperty, tandem, options ) {
    options = options || {};
    var brightnessProperty = new NumberProperty( 0 );
    var updateBrightness = Property.multilink( [ lightBulb.currentProperty, showResultsProperty, lightBulb.voltageDifferenceProperty ], function( current, running, voltageDifference ) {
      var power = Math.abs( current * voltageDifference );

      var brightness = toBrightness( 0.35, power );

      // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
      // see https://github.com/phetsims/scenery-phet/issues/225
      if ( brightness < 1E-6 ) {
        brightness = 0;
      }

      brightnessProperty.value = Util.clamp( brightness, 0, 1 );
    } );
    var lightBulbNode = new CustomLightBulbNode( brightnessProperty, {
      scale: CircuitConstructionKitConstants.BULB_SCALE
    } );

    // The icon must show the socket as well
    if ( options.icon ) {
      lightBulbNode = new Node( {
        children: [
          lightBulbNode,
          new LightBulbSocketNode( circuitConstructionKitScreenView, circuitLayerNode, lightBulb, showResultsProperty, viewProperty, tandem.createTandem( 'socketNode' ), options )
        ]
      } );
    }

    // General options used throughout bulb node
    options = _.extend( {

      // Override the dimensions of the bulb node because the invisible rays contribute to the bounds. Used to set up
      // the highlight region.
      contentWidth: 3.6,
      contentHeight: 11
    }, options );

    // Schematic creation begins here.
    var endPosition = lightBulb.endVertexProperty.get().positionProperty.get();
    var startPosition = lightBulb.startVertexProperty.get().positionProperty.get();
    var delta = endPosition.minus( startPosition );

    var rightLeadX = LEFT_LEAD_X + (delta.x + RIGHT_OFFSET);
    var schematicCircleRadius = (delta.x + RIGHT_OFFSET) / 2;

    /**
     * Adds the schematic circle with filament to the given Shape.
     * @param {Shape} shape
     * @returns Shape
     */
    var addSchematicCircle = function( shape ) {
      return shape

      // Outer circle
        .moveTo( LEFT_LEAD_X, LEAD_Y )
        .arc( (LEFT_LEAD_X + rightLeadX) / 2, LEAD_Y, schematicCircleRadius, Math.PI, -Math.PI, true )

        // Filament
        .moveTo( LEFT_LEAD_X, LEAD_Y )
        .lineTo( LEFT_LEAD_X + schematicCircleRadius - INNER_RADIUS, LEAD_Y )
        .arc( LEFT_LEAD_X + schematicCircleRadius, LEAD_Y, INNER_RADIUS, Math.PI, 0, false )
        .lineTo( rightLeadX, LEAD_Y );
    };
    var schematicNode = new Path( addSchematicCircle( new Shape()

      // Left lead
        .moveTo( LEFT_LEAD_X, 0 )
        .lineTo( LEFT_LEAD_X, LEAD_Y )

        // Right lead
        .moveTo( rightLeadX, LEAD_Y )
        .lineTo( rightLeadX, delta.y )
    ), {
      stroke: 'black',
      lineWidth: CircuitConstructionKitConstants.SCHEMATIC_LINE_WIDTH
    } ).toDataURLNodeSynchronous();
    if ( options.icon ) {
      schematicNode = new Path( addSchematicCircle( new Shape() ).transformed( Matrix3.scaling( 1.75 ) ), {
        stroke: 'black',
        lineWidth: 5,
        centerBottom: new Vector2( 0, -10 )
      } );
    }

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy();
    schematicNode.touchArea = schematicNode.bounds.copy();

    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitLayerNode, lightBulb, viewProperty, lightBulbNode, schematicNode, tandem, options );

    this.raysNode = new Node( {
      children: lightBulbNode.raysNode ? [ lightBulbNode.raysNode ] : [] // keep centering and translation
    } );

    if ( circuitLayerNode ) {

      // Render the socket node in the front
      this.socketNode = new LightBulbSocketNode( circuitConstructionKitScreenView, circuitLayerNode, lightBulb, showResultsProperty, viewProperty, tandem.createTandem( 'socketNode' ), options );
      circuitLayerNode && circuitLayerNode.lightBulbSocketLayer.addChild( this.socketNode );
      circuitLayerNode && circuitLayerNode.lightRaysLayer.addChild( this.raysNode );
    }

    this.disposeCircuitConstructionKitLightBulbNode = function() {
      updateBrightness.dispose();
      circuitLayerNode && circuitLayerNode.lightBulbSocketLayer.removeChild( this.socketNode );
      circuitLayerNode && circuitLayerNode.lightRaysLayer.removeChild( this.raysNode );
    };
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitLightBulbNode', CircuitConstructionKitLightBulbNode );

  return inherit( FixedLengthCircuitElementNode, CircuitConstructionKitLightBulbNode, {

    /**
     * TODO: factor out updateRender implementations
     * @override
     * @public
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var delta = endPosition.minus( startPosition );
      var angle = delta.angle() + Math.PI / 4;

      // Update the node transform in a single step, see #66
      CircuitConstructionKitCommonUtil.setToTranslationRotation( SCRATCH_MATRIX, startPosition, angle );
      this.contentNode.setMatrix( SCRATCH_MATRIX );
      this.raysNode.setMatrix( SCRATCH_MATRIX );

      this.highlightNode && this.highlightNode.setMatrix( SCRATCH_MATRIX );

      // Update the fire transform
      CircuitConstructionKitCommonUtil.setToTranslationRotation( SCRATCH_MATRIX, startPosition, angle )
        .multiplyMatrix( SCRATCH_MATRIX_2.setToTranslation( -100, -fireImage[ 0 ].height - 350 ) );
      this.fireNode && this.fireNode.setMatrix( SCRATCH_MATRIX );

      this.socketNode && this.socketNode.updateRender();
    },

    /**
     * Dispose when no longer used.
     * @public
     */
    dispose: function() {
      this.disposeCircuitConstructionKitLightBulbNode();
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
    },

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint: function( point ) {

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
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