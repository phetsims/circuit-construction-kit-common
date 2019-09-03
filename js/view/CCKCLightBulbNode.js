// Copyright 2015-2019, University of Colorado Boulder

/**
 * Named CCKCLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode. Renders the bulb shape
 * and brightness lines. Note that the socket is rendered in LightBulbSocketNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const Color = require( 'SCENERY/util/Color' );
  const CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LightBulbSocketNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/LightBulbSocketNode' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-middle.png' );
  const lightBulbImageHigh = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-middle-high.png' );

  // constants
  const SCRATCH_MATRIX = new Matrix3();

  // The height from the vertex to the center of the light bulb schematic circle
  const LEAD_Y = -73;

  // The "blip" in the filament that looks like an upside down "u" semicircle
  const INNER_RADIUS = 5;

  // {Node} The raster is created during instance construction and cached for future use so it isn't added to the
  // spritesheet multiple times
  let cached = null;

  /**
   * Determine the brightness for a given power
   * @param {number} multiplier - steepness of the function
   * @param {number} power - the power through the light bulb
   * @returns {number}
   */
  const toBrightness = ( multiplier, power ) => {
    const maximumBrightness = 1;

    // power at which the brightness becomes 1
    const maximumPower = 2000;
    return Math.log( 1 + power * multiplier ) * maximumBrightness / Math.log( 1 + maximumPower * multiplier );
  };

  class CCKCLightBulbNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for icon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
     * @param {LightBulb} lightBulb - the light bulb model
     * @param {Property.<boolean>} showResultsProperty - true if the sim can display values
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, lightBulb,
                 showResultsProperty, viewTypeProperty, tandem, options ) {
      options = _.extend( {
        isIcon: false
      }, options );
      const brightnessProperty = new NumberProperty( 0 );
      const updateBrightness = Property.multilink(
        [ lightBulb.currentProperty, showResultsProperty, lightBulb.resistanceProperty ],
        ( current, running, resistance ) => {
          const power = Math.abs( current * current * resistance );

          let brightness = toBrightness( 0.35, power );

          // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
          // see https://github.com/phetsims/scenery-phet/issues/225
          if ( brightness < 1E-6 ) {
            brightness = 0;
          }

          brightnessProperty.value = Util.clamp( brightness, 0, 1 );
        } );
      let lightBulbNode = new CustomLightBulbNode( brightnessProperty );

      // The isIcon must show the socket as well
      if ( options.isIcon ) {
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
      const endPosition = lightBulb.endPositionProperty.get();
      const startPosition = lightBulb.startPositionProperty.get();
      const delta = endPosition.minus( startPosition );

      const rightLeadX = delta.x;
      const schematicCircleRadius = delta.x / 2;

      /**
       * Adds the schematic circle with filament to the given Shape.
       * @param {Shape} shape
       * @returns Shape
       */
      const addSchematicCircle = shape => shape

      // Outer circle
        .moveTo( 0, LEAD_Y )
        .arc( rightLeadX / 2, LEAD_Y, schematicCircleRadius, Math.PI, -Math.PI, true )

        // Filament
        .moveTo( 0, LEAD_Y )
        .arc( schematicCircleRadius, LEAD_Y, INNER_RADIUS, Math.PI, 0, false )
        .lineTo( rightLeadX, LEAD_Y );
      let schematicNode = cached || new Path( addSchematicCircle( new Shape()

        // Left lead
          .moveTo( 0, 0 )
          .lineTo( 0, LEAD_Y )

          // Right lead
          .moveTo( rightLeadX, LEAD_Y )
          .lineTo( rightLeadX, delta.y )
      ), {
        stroke: Color.BLACK,
        lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
      } ).rasterized( { wrap: false } );
      cached = schematicNode;
      if ( options.isIcon ) {
        schematicNode = new Path( addSchematicCircle( new Shape() ).transformed( Matrix3.scaling( 1.75 ) ), {
          stroke: Color.BLACK,
          lineWidth: 5
        } );
        schematicNode.center = lightBulbNode.center.plusXY( 0, 22 );
      }

      // Expand the pointer areas with a defensive copy, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/310
      if ( !options.isIcon ) {
        schematicNode.mouseArea = schematicNode.bounds.shifted( 4, schematicNode.height );
        schematicNode.touchArea = schematicNode.mouseArea;
      }

      super(
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

      let viewListener = null;
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
        viewListener = view => {
          this.rayNodeContainer.visible = view === CircuitElementViewType.LIFELIKE;
        };
        viewTypeProperty.link( viewListener );
        circuitLayerNode && circuitLayerNode.lightBulbSocketLayer.addChild( this.socketNode );

        // Light rays are supposed to be behind everything else,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/161
        circuitLayerNode && circuitLayerNode.addChildToBackground( this.rayNodeContainer );
      }

      this.disposeCircuitConstructionKitLightBulbNode = () => {
        updateBrightness.dispose();
        circuitLayerNode && circuitLayerNode.lightBulbSocketLayer.removeChild( this.socketNode );

        // Light rays are supposed to be behind everything else,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/161
        circuitLayerNode && circuitLayerNode.removeChildFromBackground( this.rayNodeContainer );
        viewTypeProperty.unlink( viewListener );
        this.socketNode.dispose();
      };
    }

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @override
     * @protected - CCKCLightBulbNode calls updateRender for its child socket node
     */
    updateRender() {
      const startPosition = this.circuitElement.startPositionProperty.get();
      const endPosition = this.circuitElement.endPositionProperty.get();
      const angle = Vector2.getAngleBetweenVectors( startPosition, endPosition ) + Math.PI / 4;

      // Update the node transform in a single step, see #66
      SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle );
      this.contentNode.setMatrix( SCRATCH_MATRIX );
      this.rayNodeContainer.setMatrix( SCRATCH_MATRIX );
      this.highlightNode && this.highlightNode.setMatrix( SCRATCH_MATRIX );

      this.socketNode && this.socketNode.updateRender();
    }

    /**
     * Dispose when no longer used.
     * @public
     * @override
     */
    dispose() {
      this.disposeCircuitConstructionKitLightBulbNode();
      super.dispose();
    }

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint( point ) {

      // make sure bounds are correct if cut or joined in this animation frame
      this.step();

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
    }

    /**
     * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
     * @override
     * @public
     */
    updateOpacityOnInteractiveChange() {

      // TODO (black-box-study): Make the light bulb images look faded out.
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCLightBulbNode', CCKCLightBulbNode );
} );