// Copyright 2019-2023, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a ACVoltage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Shape } from '../../../kite/js/imports.js';
import MinusNode from '../../../scenery-phet/js/MinusNode.js';
import PlusNode from '../../../scenery-phet/js/PlusNode.js';
import { Circle, Node, Path } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

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
const schematicNode = createNode( true ).rasterized( { wrap: false, resolution: 2 } );
const lifelikeNode = createNode( false ).rasterized( { wrap: false, resolution: 2 } );

// Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
schematicNode.mouseArea = Shape.circle(
  CCKCConstants.AC_VOLTAGE_LENGTH - SCHEMATIC_LINE_WIDTH * 1.5,
  CCKCConstants.AC_VOLTAGE_LENGTH - SCHEMATIC_LINE_WIDTH * 1.5,
  CIRCLE_DIAMETER );
schematicNode.touchArea = schematicNode.mouseArea;

type SelfOptions = EmptySelfOptions;
type ACVoltageNodeOptions = FixedCircuitElementNodeOptions;

export default class ACVoltageNode extends FixedCircuitElementNode {

  // the ACVoltage rendered by this Node
  private readonly acSource: ACVoltage;

  // Identifies the images used to render this node so they can be pre-populated in the WebGL sprite sheet.
  public static override readonly webglSpriteNodes = [ schematicNode, lifelikeNode ];

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

    this.acSource = acSource;
  }
}

circuitConstructionKitCommon.register( 'ACVoltageNode', ACVoltageNode );