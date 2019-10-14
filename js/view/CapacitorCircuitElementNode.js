// Copyright 2015-2019, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const CapacitorConstants = require( 'SCENERY_PHET/capacitor/CapacitorConstants' );
  const CapacitorNode = require( 'SCENERY_PHET/capacitor/CapacitorNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CLBModelViewTransform3D = require( 'SCENERY_PHET/capacitor/CLBModelViewTransform3D' );
  const Color = require( 'SCENERY/util/Color' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Util = require( 'DOT/Util' );

  // images
  const wireIconImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire-icon.png' );

  // constants
  // dimensions for schematic
  const SMALL_TERMINAL_WIDTH = 104;
  const LARGE_TERMINAL_WIDTH = 104;
  const WIDTH = 188;
  const GAP = 30;
  const LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
  const RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;

  // Points sampled using Photoshop from a raster of the IEEE icon seen at
  // https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
  let schematicShape = new Shape()
    .moveTo( 0, 0 ) // left wire
    .lineTo( LEFT_JUNCTION, 0 )
    .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
    .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 )
    .moveTo( RIGHT_JUNCTION, 0 ) // right wire
    .lineTo( WIDTH, 0 )
    .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
    .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );
  const schematicWidth = schematicShape.bounds.width;
  const desiredWidth = CCKCConstants.BATTERY_LENGTH;
  const schematicScale = desiredWidth / schematicWidth;

  // Scale to fit the correct width
  schematicShape = schematicShape.transformed( Matrix3.scale( schematicScale, schematicScale ) );
  const schematicNode = new Path( schematicShape, {
    stroke: Color.BLACK,
    lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
  } ).rasterized( { wrap: false } );

  schematicNode.centerY = 0;

  // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
  schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
  schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

  class CapacitorCircuitElementNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
     * @param {Capacitor} capacitor
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, capacitor, viewTypeProperty, tandem, options ) {

      const wireImage = new Image( wireIconImage );

      // TODO: Consider making CapacitorNode more view-oriented?
      const plateBounds = new Bounds3( 0, 0, 0, 0.01414213562373095, CapacitorConstants.PLATE_HEIGHT, 0.01414213562373095 );
      const V = 4.426999999999999e-13 / 10 * 4;

      // TODO: OK to use a mock object like this, or should we create a model type
      const circuit = {
        maxPlateCharge: 2.6562e-12,
        capacitor: {
          plateSizeProperty: new Property( plateBounds ),
          plateSeparationProperty: new NumberProperty( 0.004 ),
          plateVoltageProperty: new NumberProperty( 1.5 ),
          plateChargeProperty: new NumberProperty( V ),
          getEffectiveEField() {
            return 0;
          }
        }
      };

      // TODO: DynamicProperty for getting the voltages?  Or step during model step?
      setInterval( () => {
        const value = Util.linear( -9, 9, -V, V, capacitor.getVoltage() );
        circuit.capacitor.plateChargeProperty.value = -value;
      }, 10 );
      const modelViewTransform = new CLBModelViewTransform3D();
      const plateChargeVisibleProperty = new BooleanProperty( true );
      const electricFieldVisibleProperty = new BooleanProperty( true );

      // TODO: This is probably creating far too many <canvas> elements, and also making the charges blurry
      const lifelikeNode = new CapacitorNode( circuit, modelViewTransform, plateChargeVisibleProperty, electricFieldVisibleProperty,
        Tandem.optional );

      lifelikeNode.mutate( {
        scale: 0.45,
        rotation: -Math.PI / 2
      } );

      lifelikeNode.mutate( {
        centerX: capacitor.distanceBetweenVertices / 2,

        // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
        centerY: 0
      } );
      wireImage.mutate( {
        centerX: lifelikeNode.centerX,
        centerY: lifelikeNode.centerY
      } );

      super(
        screenView,
        circuitLayerNode,
        capacitor,
        viewTypeProperty,
        new Node( {
          children: [ wireImage, lifelikeNode ]
        } ),
        schematicNode,
        tandem,
        options
      );

      // @public (read-only) {Capacitor} - the Capacitor rendered by this Node
      this.capacitor = capacitor;

      // TODO: HACK ALERT, see https://github.com/phetsims/circuit-construction-kit-common/issues/524
      this.capacitor.node = lifelikeNode;
    }

    dispose() {

      // TODO: HACK ALERT, see https://github.com/phetsims/circuit-construction-kit-common/issues/524
      delete this.capacitor.node;
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
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  CapacitorCircuitElementNode.webglSpriteNodes = [
    new Image( wireIconImage )
  ];

  return circuitConstructionKitCommon.register( 'CapacitorCircuitElementNode', CapacitorCircuitElementNode );
} );