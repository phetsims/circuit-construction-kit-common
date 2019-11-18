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
  const LineStyles = require( 'KITE/util/LineStyles' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );

  // constants
  // dimensions for schematic
  const NUMBER_OF_BUMPS = 4;
  const SCHEMATIC_WIDTH = CCKCConstants.INDUCTOR_LENGTH;
  const SCHEMATIC_MARGIN = 20;
  const SCHEMATIC_ARC_RADIUS = ( SCHEMATIC_WIDTH - SCHEMATIC_MARGIN * 2 ) / NUMBER_OF_BUMPS / 2;

  const schematicShape = new Shape()
    .moveTo( 0, 0 ) // left wire
    .lineTo( SCHEMATIC_MARGIN, 0 )
    .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 1, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false ) // left plate
    .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 3, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false ) // left plate
    .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 5, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false ) // left plate
    .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 7, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false ) // left plate
    .lineTo( SCHEMATIC_WIDTH, 0 );

  const LIFELIKE_HEIGHT = 60;
  const LIFELIKE_WIDTH = CCKCConstants.INDUCTOR_LENGTH;
  const LIFELIKE_RADIUS_X = 5;
  const LIFELIKE_RADIUS_Y = LIFELIKE_HEIGHT / 2;
  const LIFELIKE_WIRE_LINE_WIDTH = 3;

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

      options = merge( { isIcon: false, useHitTestForSensors: true }, options );

      // The main body, in front.
      const lifelikeBodyShape = new Shape()
        .ellipticalArc( LIFELIKE_WIDTH, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, -Math.PI / 2, Math.PI / 2, false )
        .ellipticalArc( 0, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, Math.PI / 2, -Math.PI / 2, true )
        .close();
      const lifelikeBodyPath = new Path( lifelikeBodyShape, { fill: 'white', stroke: 'black' } );

      // The elliptical edge shown to the left of the main body.
      const lifelikeEndCapShape = new Shape()
        .ellipticalArc( 0, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, 0, Math.PI * 2, false )
        .close();
      const lifelikeEndCapPath = new Path( lifelikeEndCapShape, {
        fill: '#c4c4c4',
        stroke: 'black'
      } );

      // Container that has individual wire loops.
      const wireWrapNode = new Node();
      inductor.inductanceProperty.link( inductance => {

        const numLoops = Util.roundSymmetric( Util.linear( 10, 100, 5, 20, inductance ) );
        const children = [];
        for ( let i = 0; i < numLoops; i++ ) {
          const wireShape = new Shape()
            .ellipticalArc( 0, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, -Math.PI / 2, Math.PI / 2, false )
            .getStrokedShape( new LineStyles( { lineWidth: LIFELIKE_WIRE_LINE_WIDTH } ) );
          const wirePath = new Path( wireShape, {
            fill: '#dc9180',
            stroke: 'black',
            x: Util.linear(
              numLoops / 2, numLoops / 2 + 1,
              LIFELIKE_WIDTH / 2 + LIFELIKE_RADIUS_X / 2, LIFELIKE_WIDTH / 2 + LIFELIKE_WIRE_LINE_WIDTH + LIFELIKE_RADIUS_X / 2,
              i )
          } );
          wireWrapNode.addChild( wirePath );
          children.push( wirePath );
        }
        wireWrapNode.children = children;
      } );

      const lifelikeNode = new Node( {
        children: [ lifelikeEndCapPath, lifelikeBodyPath, wireWrapNode ],
        centerY: 0
      } );

      const width = options.isIcon ? CCKCConstants.INDUCTOR_LENGTH : inductor.distanceBetweenVertices;
      lifelikeNode.mutate( {
        scale: width / lifelikeNode.width
      } );

      const scale = lifelikeNode.width / schematicShape.bounds.width;

      // Scale to fit the correct width
      const scaledShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
      const schematicNode = new Path( scaledShape, {
        stroke: Color.BLACK,
        lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
      } );

      // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
      schematicNode.mouseArea = schematicNode.bounds.dilated( 2 );
      schematicNode.touchArea = schematicNode.bounds.dilated( 2 );

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

      // @public (read-only) {Inductor}
      this.inductor = inductor;
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  InductorNode.webglSpriteNodes = [];

  return circuitConstructionKitCommon.register( 'InductorNode', InductorNode );
} );