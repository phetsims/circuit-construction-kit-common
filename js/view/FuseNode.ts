// Copyright 2019-2023, University of Colorado Boulder

/**
 * This node shows a fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Color, Image, Node, Path, Rectangle } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import fuse_png from '../../images/fuse_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Fuse from '../model/Fuse.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import FuseTripAnimation from './FuseTripAnimation.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import SchematicType from './SchematicType.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

// constants
const SCHEMATIC_STEM_WIDTH = 20;
const HORIZONTAL_ZIG_ZAG_DISTANCE = 5;
const VERTICAL_ZIG_ZAG_HEIGHT = 4;
const CAP_WIDTH = 15; // horizontal size of each cap in the image
const SPLIT_DY = 13; // in view coordinates, amplitude of the zig-zag pattern when the fuse is tripped
const SPLIT_DX = 8; // in view coordinates, half the distance of the split part of the fuse when tripped
const VERTICAL_GLASS_MARGIN = 3;
const DEFAULT_GLASS_FILL = '#c3dbfd';

type SelfOptions = EmptySelfOptions;
type FuseNodeOptions = SelfOptions & FixedCircuitElementNodeOptions;

export default class FuseNode extends FixedCircuitElementNode {
  private readonly fuse: Fuse;
  private readonly disposeFuseNode: () => void;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static override readonly webglSpriteNodes = [
    new Image( fuse_png )
  ];

  /**
   * @param screenView - main screen view, null for isIcon
   * @param circuitNode, null for isIcon
   * @param fuse
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, fuse: Fuse,
                      viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: FuseNodeOptions ) {

    const options = optionize<FuseNodeOptions, SelfOptions, FixedCircuitElementNodeOptions>()( {
      isIcon: false,
      useHitTestForSensors: true
    }, providedOptions );

    const fuseImageNode = new Image( fuse_png, { scale: 0.691 } );
    const numberOfZigZags = ( fuseImageNode.width - CAP_WIDTH * 2 ) / HORIZONTAL_ZIG_ZAG_DISTANCE / 2;

    // zig-zag shape
    const startPoint = new Vector2( CAP_WIDTH, 0 );
    const endPoint = new Vector2( fuseImageNode.width - CAP_WIDTH, 0 );
    const filamentShape = new Shape().moveToPoint( startPoint )
      .zigZagToPoint( endPoint, VERTICAL_ZIG_ZAG_HEIGHT, Utils.roundSymmetric( numberOfZigZags ), false );

    const brokenFilamentShape = new Shape().moveToPoint( startPoint )
      .zigZagToPoint( new Vector2( fuseImageNode.width / 2 - SPLIT_DX, SPLIT_DY ), VERTICAL_ZIG_ZAG_HEIGHT, Utils.roundSymmetric( numberOfZigZags / 2 ) - 1, false );
    brokenFilamentShape.moveToPoint( endPoint );
    brokenFilamentShape
      .zigZagToPoint( new Vector2( fuseImageNode.width / 2 + SPLIT_DX, -SPLIT_DY ), VERTICAL_ZIG_ZAG_HEIGHT, Utils.roundSymmetric( numberOfZigZags / 2 ) - 1, false );

    const filamentPath = new Path( filamentShape, {
      stroke: '#302b2b',
      lineWidth: 4,
      center: fuseImageNode.center
    } );

    // Fuse filament thickness is proportional to its current rating
    const updateFilamentPathLineWidth = ( currentRating: number ) => filamentPath.setLineWidth( Utils.linear(
      fuse.currentRatingProperty.range.min, fuse.currentRatingProperty.range.max, 1, 4, currentRating
    ) );
    fuse.currentRatingProperty.link( updateFilamentPathLineWidth );

    // Glass covering
    const glassNode = new Rectangle( CAP_WIDTH, VERTICAL_GLASS_MARGIN, fuseImageNode.width - CAP_WIDTH * 2, fuseImageNode.height - VERTICAL_GLASS_MARGIN * 2, {
      fill: DEFAULT_GLASS_FILL,
      opacity: 0.5,
      stroke: 'black',
      lineWidth: 0.5
    } );

    const lifelikeFuseNode = new Node( {
      children: [ filamentPath, glassNode, fuseImageNode ]
    } );

    // Schematic view is a line with a box around it, looks the same whether tripped or untripped.
    const boxHeight = 30;
    const boxWidth = fuse.chargePathLength - SCHEMATIC_STEM_WIDTH * 2;
    let schematicShape = new Shape()
      .moveTo( 0, 0 )
      .lineToRelative( fuse.chargePathLength, 0 )
      .moveTo( 0, 0 )
      .rect( SCHEMATIC_STEM_WIDTH, -boxHeight / 2, boxWidth, boxHeight );

    // Icons should appear the same in the toolbox, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/389
    const width = options.isIcon ? CCKCConstants.RESISTOR_LENGTH : fuse.distanceBetweenVertices;
    lifelikeFuseNode.mutate( { scale: width / lifelikeFuseNode.width } );

    const scale = lifelikeFuseNode.width / schematicShape.bounds.width;
    schematicShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
    const schematicNode = new Path( schematicShape, {
      stroke: Color.BLACK,
      lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
    } );

    ///// IEC fuse: also a box with two horizontal leads (left and right) and two small vertical lines on the inside
    // (see https://github.com/phetsims/circuit-construction-kit-common/issues/429 for a figure)

    const boxLength7th = boxWidth / 7;
    const fuseIEC = new Shape()
      .moveTo( 0, schematicShape.bounds.centerY )

      // left horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // upper half of the box
      .lineToRelative( 0, -boxHeight / 2 )
      .lineToRelative( boxWidth, 0 )
      .lineToRelative( 0, boxHeight / 2 )

      // right horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // go back along the right horizontal lead
      .lineToRelative( -SCHEMATIC_STEM_WIDTH, 0 )

      // lower half og the box
      .lineToRelative( 0, boxHeight / 2 )
      .lineToRelative( -boxWidth, 0 )

      // small left vertical line. Place it at x = boxLength / 7 (seems to be visually a good place)
      .lineToRelative( 0, -boxHeight )
      .lineToRelative( boxLength7th, 0 )
      .lineToRelative( 0, boxHeight )

      /* small right vertical line: the 1st 'lineToRelative' below takes to starting point, at the cost
      of drawing a line on an already existing one. */
      .lineToRelative( boxWidth - 2 * boxLength7th, 0 )
      .lineToRelative( 0, -boxHeight );

    const updateSchematicType = ( schematicType: SchematicType ) => {
      schematicNode.shape = ( schematicType === SchematicType.IEEE || schematicType === SchematicType.BRITISH ) ? schematicShape :
                            fuseIEC;
    };
    schematicTypeProperty.link( updateSchematicType );

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    schematicNode.centerY = 0;
    lifelikeFuseNode.centerY = 0;

    // Expand the pointer areas with a defensive copy, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy();
    schematicNode.touchArea = schematicNode.bounds.copy();

    super( screenView, circuitNode, fuse, viewTypeProperty, lifelikeFuseNode, schematicNode, tandem, options );

    this.fuse = fuse;

    // Update the look when the fuse is tripped
    const updateTripped = ( isTripped: boolean ) => {
      if ( isTripped && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        circuitNode!.addChild( new FuseTripAnimation( { center: this.center } ) );
      }
      glassNode.fill = isTripped ? '#4e4e4e' : DEFAULT_GLASS_FILL;
      filamentPath.shape = isTripped ? brokenFilamentShape : filamentShape;
    };
    if ( !options.isIcon ) {
      this.fuse.isTrippedProperty.link( updateTripped );
    }

    this.disposeFuseNode = () => {
      lifelikeFuseNode.dispose();
      fuse.currentRatingProperty.unlink( updateFilamentPathLineWidth );
      if ( !options.isIcon ) {
        this.fuse.isTrippedProperty.unlink( updateTripped );
      }
      schematicTypeProperty.unlink( updateSchematicType );
    };
  }

  public override dispose(): void {
    this.disposeFuseNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'FuseNode', FuseNode );