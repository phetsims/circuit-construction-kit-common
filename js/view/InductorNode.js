// Copyright 2015-2019, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for an Inductor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LineStyles = require( 'KITE/util/LineStyles' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );

  // images
  const batteryImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

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

  class InductorNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
     * @param {Inductor} inductor
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, inductor, viewTypeProperty, tandem, options ) {
      const radiusX = 5;
      const height = 60;
      const width = CCKCConstants.BATTERY_LENGTH;
      const radiusY = height / 2;
      const frontShape = new Shape()
        .lineTo( width, 0 )// TODO: eliminate unnecessary lineTos.  arc automatically lineTos
        .ellipticalArc( width, height / 2, radiusX, radiusY, 0, -Math.PI / 2, Math.PI / 2, false )
        .lineTo( 0, height )
        .ellipticalArc( 0, height / 2, radiusX, radiusY, 0, Math.PI / 2, -Math.PI / 2, true )
        .close();
      const frontPath = new Path( frontShape, { fill: 'white', stroke: 'black' } );

      const backCap = new Shape()
        .ellipticalArc( 0, height / 2, radiusX, radiusY, 0, 0, Math.PI * 2, false )
        .close();
      const backCapPath = new Path( backCap, {
        fill: '#c4c4c4',
        stroke: 'black'
      } );

      const wireWrappingNode = new Node();


      inductor.inductanceProperty.link( inductance => {

        const children = [];
        const numLoops = Util.roundSymmetric( Util.linear( 10, 100, 5, 20, inductance ) );
        for ( let i = 0; i < numLoops; i++ ) {
          const WIRE_LINE_WIDTH = 3;
          const wireShape = new Shape()
            .ellipticalArc( 0, height / 2, radiusX, radiusY, 0, -Math.PI / 2, Math.PI / 2, false )
            .getStrokedShape( new LineStyles( { lineWidth: WIRE_LINE_WIDTH } ) );
          const wirePath = new Path( wireShape, {
            fill: '#dc9180',
            stroke: 'black',
            x: Util.linear(
              numLoops / 2, numLoops / 2 + 1,
              width / 2 + radiusX / 2, width / 2 + WIRE_LINE_WIDTH + radiusX / 2,
              i )
          } );
          wireWrappingNode.addChild( wirePath );
          children.push( wirePath );
        }
        wireWrappingNode.children = children;
      } );

      const lifelikeNode = new Node( {
        children: [ backCapPath, frontPath, wireWrappingNode ],
        centerY: 0
      } );

      super(
        screenView,
        circuitLayerNode,
        inductor,
        viewTypeProperty,
        lifelikeNode,
        schematicNode,
        tandem,
        options
      );

      // @public (read-only) {Capacitor} - the Capacitor rendered by this Node
      this.inductor = inductor;
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
  InductorNode.webglSpriteNodes = [
    new Image( batteryImage )
  ];

  return circuitConstructionKitCommon.register( 'InductorNode', InductorNode );
} );