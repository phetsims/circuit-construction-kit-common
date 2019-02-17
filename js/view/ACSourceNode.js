// Copyright 2015-2019, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a ACSource.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACSource = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACSource' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const MinusNode = require( 'SCENERY_PHET/MinusNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PlusNode = require( 'SCENERY_PHET/PlusNode' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const WIDTH = 188;

  const sineCurveShape = new Shape();
  const f = x => 13 * Math.sin( x );

  for ( let x = 0; x < Math.PI * 2; x += Math.PI / 2 / 100 ) {
    const a = x * 10;
    if ( x === 0 ) {
      sineCurveShape.moveTo( a, f( x ) );
    }
    else {
      sineCurveShape.lineTo( a, f( x ) );
    }
  }

  // Scale to fit the correct width
  const sineCurvePath = new Path( sineCurveShape, {
    stroke: 'black',
    lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH,
    centerX: 0
  } );
  const signSeparation = 27;
  const template = new Node( {
    x: WIDTH / 4,
    children: [
      new Circle( WIDTH / 4, {
        stroke: 'black',
        lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH,
        centerX: 0
      } ),
      sineCurvePath,
      new PlusNode( {
        size: new Dimension2( 10, 2.5 ),
        centerX: 0,
        centerY: -signSeparation
      } ),
      new MinusNode( {
        size: new Dimension2( 10, 2.5 ),
        centerX: 0,
        centerY: signSeparation
      } )
    ]
  } );
  const schematicNode = template.toDataURLImageSynchronous();
  const lifelikeNode = template.toDataURLImageSynchronous();

  schematicNode.centerY = 0;

  // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
  schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
  schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

  class ACSourceNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
     * @param {ACSource} acSource
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, acSource, viewTypeProperty, tandem, options ) {
      assert && assert( acSource instanceof ACSource, 'should be AC source' );

      // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
      lifelikeNode.centerY = 0;

      super(
        screenView,
        circuitLayerNode,
        acSource,
        viewTypeProperty,
        lifelikeNode,
        schematicNode,
        tandem,
        options
      );

      // @public (read-only) {ACSource} - the ACSource rendered by this Node
      this.acSource = acSource;

      // @public (read-only) For ValueNode
      this.numberOfDecimalPlaces = 1;
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
      this.step(); // TODO: Shouldn't step take dt?

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  ACSourceNode.webglSpriteNodes = [ schematicNode, lifelikeNode ];

  return circuitConstructionKitCommon.register( 'ACSourceNode', ACSourceNode );
} );