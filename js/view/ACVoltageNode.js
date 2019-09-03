// Copyright 2019, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a ACVoltage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
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
  const sineCurveShape = new Shape();
  const f = x => 9 * Math.sin( x );

  for ( let x = 0; x < Math.PI * 2; x += Math.PI / 2 / 100 ) {
    const a = x * 5.5;
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
    lineWidth: 2,
    centerX: 0
  } );

  const CIRCLE_DIAMETER = 54;
  const signSeparation = CIRCLE_DIAMETER * 0.32;
  const signScale = 0.8;
  const template = new Node( {
    x: CCKCConstants.AC_VOLTAGE_LENGTH / 2,
    children: [
      new Circle( CIRCLE_DIAMETER / 2, {
        stroke: 'black',
        fill: 'white',
        lineWidth: 2,
        centerX: 0
      } ),
      sineCurvePath,
      new PlusNode( {
        size: new Dimension2( 10 * signScale, 2.5 * signScale ),
        centerX: 0,
        centerY: -signSeparation
      } ),
      new MinusNode( {
        size: new Dimension2( 10 * signScale, 2.5 * signScale ),
        centerX: 0,
        centerY: signSeparation
      } )
    ]
  } );
  const schematicNode = template.rasterized( { wrap: false } );
  const lifelikeNode = template.rasterized( { wrap: false } );

  schematicNode.centerY = 0;

  // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
  schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
  schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

  class ACVoltageNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
     * @param {ACVoltage} acSource
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, acSource, viewTypeProperty, tandem, options ) {
      assert && assert( acSource instanceof ACVoltage, 'should be AC voltage' );

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

      // @public (read-only) {ACVoltage} - the ACVoltage rendered by this Node
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
      this.step();

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  ACVoltageNode.webglSpriteNodes = [ schematicNode, lifelikeNode ];

  return circuitConstructionKitCommon.register( 'ACVoltageNode', ACVoltageNode );
} );