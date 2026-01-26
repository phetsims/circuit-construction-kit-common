// Copyright 2019-2025, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a ACVoltage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Shape from '../../../kite/js/Shape.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import MinusNode from '../../../scenery-phet/js/MinusNode.js';
import PlusNode from '../../../scenery-phet/js/PlusNode.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type ACVoltage from '../model/ACVoltage.js';
import type CircuitElementViewType from '../model/CircuitElementViewType.js';
import type CCKCScreenView from './CCKCScreenView.js';
import type CircuitNode from './CircuitNode.js';
import FixedCircuitElementNode, { type FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';

// constants
const sineCurveShape = new Shape();
const f = ( x: number ) => 9 * Math.sin( x );

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
  lineWidth: 4,
  centerX: 0
} );

const CIRCLE_DIAMETER = 54;
const signSeparation = CIRCLE_DIAMETER * 0.32;
const signScale = 1;
const SCHEMATIC_LINE_WIDTH = 4;
const LIFELIKE_LINE_WIDTH = 2;

/**
 * @param schematic - whether to show the schematic (instead of lifelike) form
 */
const createNode = ( schematic: boolean ) => new Node( {
  x: CCKCConstants.AC_VOLTAGE_LENGTH / 2,
  children: [
    new Circle( CIRCLE_DIAMETER / 2, {
      stroke: 'black',
      fill: schematic ? null : 'white',
      lineWidth: schematic ? SCHEMATIC_LINE_WIDTH : LIFELIKE_LINE_WIDTH,
      centerX: 0
    } ),
    sineCurvePath,
    ...schematic ? [] :
      [ new PlusNode( {
        size: new Dimension2( 10 * signScale, 2.5 * signScale ),
        centerX: 0,
        centerY: -signSeparation
      } ),
        new MinusNode( {
          size: new Dimension2( 10 * signScale, 2.5 * signScale ),
          centerX: 0,
          centerY: signSeparation
        } ) ]
  ]
} );
const schematicNode = createNode( true );
const lifelikeNode = createNode( false );

// Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
schematicNode.mouseArea = Shape.circle(
  CCKCConstants.AC_VOLTAGE_LENGTH - SCHEMATIC_LINE_WIDTH * 1.5,
  CCKCConstants.AC_VOLTAGE_LENGTH - SCHEMATIC_LINE_WIDTH * 1.5,
  CIRCLE_DIAMETER );
schematicNode.touchArea = schematicNode.mouseArea;

type SelfOptions = EmptySelfOptions;
type ACVoltageNodeOptions = FixedCircuitElementNodeOptions;

export default class ACVoltageNode extends FixedCircuitElementNode {

  /**
   * @param screenView - main screen view, null for isIcon
   * @param circuitNode, null for icon
   * @param acSource
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, acSource: ACVoltage,
                      viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: ACVoltageNodeOptions ) {
    const options = optionize<ACVoltageNodeOptions, SelfOptions, FixedCircuitElementNodeOptions>()( {
      useHitTestForSensors: true
    }, providedOptions );

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    super(
      screenView,
      circuitNode,
      acSource,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );
  }
}

circuitConstructionKitCommon.register( 'ACVoltageNode', ACVoltageNode );