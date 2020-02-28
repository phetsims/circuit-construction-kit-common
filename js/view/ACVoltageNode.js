// Copyright 2019-2020, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a ACVoltage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import MinusNode from '../../../scenery-phet/js/MinusNode.js';
import PlusNode from '../../../scenery-phet/js/PlusNode.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';

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
    options = merge( {
      numberOfDecimalPlaces: 1,
      useHitTestForSensors: true
    }, options );
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
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
ACVoltageNode.webglSpriteNodes = [ schematicNode, lifelikeNode ];

circuitConstructionKitCommon.register( 'ACVoltageNode', ACVoltageNode );
export default ACVoltageNode;