// Copyright 2015-2017, University of Colorado Boulder

/**
 * Named CircuitConstructionKitLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode. Renders the bulb shape
 * and brightness lines. Note that the socket is rendered in LightBulbSocketNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  var LightBulbSocketNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/LightBulbSocketNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Color = require( 'SCENERY/util/Color' );

  // images
  var lightBulbImageHigh = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-middle-high.png' );
  var lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-middle.png' );

  // constants
  var SCRATCH_MATRIX = new Matrix3();

  // The height from the vertex to the center of the light bulb schematic circle
  var LEAD_Y = -73;

  // The "blip" in the filament that looks like an upside down "u" semicircle
  var INNER_RADIUS = 5;

  // {Node} The raster is created during instance construction and cached for future use so it isn't added to the
  // spritesheet multiple times
  var cached = null;

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
   * @param {CircuitConstructionKitScreenView|null} screenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<boolean>} showResultsProperty - true if the sim can display values
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitLightBulbNode( screenView, circuitLayerNode, lightBulb,
                                                showResultsProperty, viewTypeProperty, tandem, options ) {
    var self = this;
    options = _.extend( {
      icon: false
    }, options );
    var brightnessProperty = new NumberProperty( 0 );
    var updateBrightness = Property.multilink(
      [ lightBulb.currentProperty, showResultsProperty, lightBulb.resistanceProperty ],
      function( current, running, resistance ) {
        var power = Math.abs( current * current * resistance );

        var brightness = toBrightness( 0.35, power );

        // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
        // see https://github.com/phetsims/scenery-phet/issues/225
        if ( brightness < 1E-6 ) {
          brightness = 0;
        }

        brightnessProperty.value = Util.clamp( brightness, 0, 1 );
      } );
    var lightBulbNode = new CustomLightBulbNode( brightnessProperty );

    // The icon must show the socket as well
    if ( options.icon ) {
      lightBulbNode = new Image( lightBulb.highResistance ? lightBulbImageHigh : lightBulbImage, { scale: 0.37 } );
    }

    // General options used throughout bulb node
    options = _.extend( {

      // Override the dimensions of the bulb node because the invisible rays contribute to the bounds. Used to set up
      // the highlight region.
      contentWidth: 3.6,
      contentHeight: 11
    }, options );

    // Schematic creation begins here.
    var endPosition = lightBulb.endPositionProperty.get();
    var startPosition = lightBulb.startPositionProperty.get();
    var delta = endPosition.minus( startPosition );

    var rightLeadX = delta.x;
    var schematicCircleRadius = delta.x / 2;

    /**
     * Adds the schematic circle with filament to the given Shape.
     * @param {Shape} shape
     * @returns Shape
     */
    var addSchematicCircle = function( shape ) {
      return shape

      // Outer circle
        .moveTo( 0, LEAD_Y )
        .arc( rightLeadX / 2, LEAD_Y, schematicCircleRadius, Math.PI, -Math.PI, true )

        // Filament
        .moveTo( 0, LEAD_Y )
        .arc( schematicCircleRadius, LEAD_Y, INNER_RADIUS, Math.PI, 0, false )
        .lineTo( rightLeadX, LEAD_Y );
    };
    var schematicNode = cached || new Path( addSchematicCircle( new Shape()

      // Left lead
      .moveTo( 0, 0 )
      .lineTo( 0, LEAD_Y )

        // Right lead
        .moveTo( rightLeadX, LEAD_Y )
        .lineTo( rightLeadX, delta.y )
    ), {
      stroke: Color.BLACK,
      lineWidth: CircuitConstructionKitCommonConstants.SCHEMATIC_LINE_WIDTH
    } ).toDataURLImageSynchronous();
    cached = schematicNode;
    if ( options.icon ) {
      schematicNode = new Path( addSchematicCircle( new Shape() ).transformed( Matrix3.scaling( 1.75 ) ), {
        stroke: Color.BLACK,
        lineWidth: 5
      } );
      schematicNode.center = lightBulbNode.center.plusXY( 0, 22 );
    }

    // Expand the pointer areas with a defensive copy, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy().shifted( 9, schematicNode.height );
    schematicNode.touchArea = schematicNode.bounds.copy().shifted( 9, schematicNode.height );

    FixedCircuitElementNode.call(
      this,
      screenView,
      circuitLayerNode,
      lightBulb,
      viewTypeProperty,
      lightBulbNode,
      schematicNode,
      tandem,
      options
    );

    // @private {Node} - node that contains the light rays so they can be easily positioned
    this.rayNodeContainer = new Node( {
      children: lightBulbNode.raysNode ? [ lightBulbNode.raysNode ] : [] // keep centering and translation
    } );

    if ( circuitLayerNode ) {

      // Render the socket node in the front
      this.socketNode = new LightBulbSocketNode(
        screenView,
        circuitLayerNode,
        lightBulb,
        viewTypeProperty,
        tandem.createTandem( 'socketNode' ),
        options
      );
      var viewListener = function( view ) {
        self.rayNodeContainer.visible = view === CircuitElementViewType.LIFELIKE;
      };
      viewTypeProperty.link( viewListener );
      circuitLayerNode && circuitLayerNode.lightBulbSocketLayer.addChild( this.socketNode );

      // Light rays are supposed to be behind everything else,
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/161
      circuitLayerNode && circuitLayerNode.addChildToBackground( this.rayNodeContainer );
    }

    this.disposeCircuitConstructionKitLightBulbNode = function() {
      updateBrightness.dispose();
      circuitLayerNode && circuitLayerNode.lightBulbSocketLayer.removeChild( self.socketNode );

      // Light rays are supposed to be behind everything else,
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/161
      circuitLayerNode && circuitLayerNode.removeChildFromBackground( self.rayNodeContainer );
      viewTypeProperty.unlink( viewListener );
      self.socketNode.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitLightBulbNode', CircuitConstructionKitLightBulbNode );

  return inherit( FixedCircuitElementNode, CircuitConstructionKitLightBulbNode, {

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @override
     * @protected - CircuitConstructionKitLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startPositionProperty.get();
      var endPosition = this.circuitElement.endPositionProperty.get();
      var angle = Vector2.getAngleBetweenVectors( startPosition, endPosition ) + Math.PI / 4;

      // Update the node transform in a single step, see #66
      SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle );
      this.contentNode.setMatrix( SCRATCH_MATRIX );
      this.rayNodeContainer.setMatrix( SCRATCH_MATRIX );
      this.highlightNode && this.highlightNode.setMatrix( SCRATCH_MATRIX );

      this.socketNode && this.socketNode.updateRender();
    },

    /**
     * Dispose when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeCircuitConstructionKitLightBulbNode();
      FixedCircuitElementNode.prototype.dispose.call( this );
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