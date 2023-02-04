// Copyright 2015-2023, University of Colorado Boulder

/**
 * This node shows a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import { Shape } from '../../../kite/js/imports.js';
import { Color, Image, Node, Path, Rectangle } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import coin_png from '../../images/coin_png.js';
import dog_png from '../../images/dog_png.js';
import dollar_png from '../../images/dollar_png.js';
import eraser_png from '../../images/eraser_png.js';
import hand_png from '../../images/hand_png.js';
import paperClip_png from '../../images/paperClip_png.js';
import pencil_png from '../../images/pencil_png.js';
import resistorHigh_png from '../../images/resistorHigh_png.js';
import resistor_png from '../../images/resistor_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Resistor from '../model/Resistor.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import ResistorColors from './ResistorColors.js';
import schematicTypeProperty from './schematicTypeProperty.js';
import SchematicType from './SchematicType.js';
import ResistorType from '../model/ResistorType.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';

// constants

// hard coded because Image.width and Image.initialWidth sometimes return bad values in the built version
const LIFELIKE_IMAGE_WIDTH = 150;
const COLOR_BAND_WIDTH = 10;
const COLOR_BAND_HEIGHT = 39.75;
const COLOR_BAND_TOP = -0.25;
const COLOR_BAND_PADDING = 33;
const AVAILABLE_COLOR_BAND_SPACE = LIFELIKE_IMAGE_WIDTH - 2 * COLOR_BAND_PADDING;

// max is 4 bands, even though they are not always shown
const REMAINING_COLOR_BAND_SPACE = AVAILABLE_COLOR_BAND_SPACE - 4 * COLOR_BAND_WIDTH;
const COLOR_BAND_SPACING = REMAINING_COLOR_BAND_SPACE / 4 - 2; // two spaces before last band
const COLOR_BAND_Y = COLOR_BAND_TOP + 2.5;

// Points sampled using Photoshop from a raster of the IEEE isIcon seen at
// https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
const SCHEMATIC_SCALE = 0.54;
const SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
const SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
const SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

const RESISTOR_IMAGE_MAP = new Map<ResistorType, HTMLImageElement>();
RESISTOR_IMAGE_MAP.set( ResistorType.COIN, coin_png );
RESISTOR_IMAGE_MAP.set( ResistorType.PAPER_CLIP, paperClip_png );
RESISTOR_IMAGE_MAP.set( ResistorType.PENCIL, pencil_png );
RESISTOR_IMAGE_MAP.set( ResistorType.ERASER, eraser_png );
RESISTOR_IMAGE_MAP.set( ResistorType.HAND, hand_png );
RESISTOR_IMAGE_MAP.set( ResistorType.EXTREME_RESISTOR, resistorHigh_png );
RESISTOR_IMAGE_MAP.set( ResistorType.RESISTOR, resistor_png );
RESISTOR_IMAGE_MAP.set( ResistorType.DOG, dog_png );
RESISTOR_IMAGE_MAP.set( ResistorType.DOLLAR_BILL, dollar_png );

export default class ResistorNode extends FixedCircuitElementNode {
  private readonly resistor: Resistor;
  private readonly lifelikeResistorImageNode: Node;
  private readonly disposeResistorNode: () => void;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static override readonly webglSpriteNodes = [
    new Image( resistor_png ),
    new Image( paperClip_png ),
    new Image( coin_png ),
    new Image( pencil_png ),
    new Image( eraser_png ),
    new Image( hand_png ),
    new Image( resistorHigh_png ),
    new Image( dog_png ),
    new Image( dollar_png )
  ];

  /**
   * @param screenView - main screen view, null for isIcon
   * @param circuitNode, null for isIcon
   * @param resistor
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, resistor: Resistor,
                      viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: FixedCircuitElementNodeOptions ) {

    providedOptions = combineOptions<FixedCircuitElementNodeOptions>( { isIcon: false, useHitTestForSensors: true }, providedOptions );

    // Assigned to instance variable after super()
    const lifelikeResistorImageNode = new Image( RESISTOR_IMAGE_MAP.get( resistor.resistorType )! );

    let updateColorBands: ( ( n: number ) => void ) | null = null;

    let colorBandsNode: null | Node = null;

    // Add color bands for the normal resistor
    if ( resistor.resistorType === ResistorType.RESISTOR ) {

      // Color bands for resistance > 0
      const colorBands = _.range( 4 ).map( index => {

        const additionalOffset = index === 3 ? 12 : 0;
        return new Rectangle(
          COLOR_BAND_PADDING + ( COLOR_BAND_WIDTH + COLOR_BAND_SPACING ) * index + additionalOffset, COLOR_BAND_Y,
          COLOR_BAND_WIDTH, COLOR_BAND_HEIGHT
        );
      } );

      // Single color band when resistance = 0 which appears in the middle
      const singleColorBand = new Rectangle( 0, 0, COLOR_BAND_WIDTH, COLOR_BAND_HEIGHT, {
        centerX: COLOR_BAND_PADDING + AVAILABLE_COLOR_BAND_SPACE / 2,
        y: COLOR_BAND_Y
      } );

      /**
       * When the resistance changes, update the colors of the color bands.
       */
      updateColorBands = ( resistance: number ) => {
        const colors = ResistorColors.getColorArray( resistance );

        if ( colors.length === 1 ) {
          singleColorBand.fill = colors[ 0 ];
          assert && assert( colors[ 0 ] !== null && colors[ 0 ].equals( Color.BLACK ), 'single band should be black' );
          colorBands.forEach( colorBand => { colorBand.fill = null; } );
        }
        else {

          // Show all 4 colors bands and hide the 0-resistance band
          singleColorBand.fill = null;
          for ( let i = 0; i < colorBands.length; i++ ) {
            colorBands[ i ].fill = colors[ i ];
          }
        }
      };
      resistor.resistanceProperty.link( updateColorBands );

      // Add the color bands to the resistor image
      colorBandsNode = new Node( {
        children: [ ...colorBands, singleColorBand ]
      } );
      resistor.isColorCodeVisibleProperty.link( isColorCodeVisible => {
        colorBandsNode!.visible = isColorCodeVisible;
      } );
      lifelikeResistorImageNode.addChild( colorBandsNode );
    }

    // Icons should appear the same in the toolbox, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/389
    const width = providedOptions.isIcon ? CCKCConstants.RESISTOR_LENGTH : resistor.distanceBetweenVertices;
    lifelikeResistorImageNode.mutate( {
      scale: width / lifelikeResistorImageNode.width
    } );

    // Classical zig-zag shape
    let ieeeSchematicShape = new Shape()
      .moveTo( 0, lifelikeResistorImageNode.height * SCHEMATIC_SCALE )
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )
      .lineToRelative( SCHEMATIC_PERIOD / 2, -SCHEMATIC_WAVELENGTH / 2 )
      .lineToRelative( SCHEMATIC_PERIOD, SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, -SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, -SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD / 2, -SCHEMATIC_WAVELENGTH / 2 )
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 );

    let scale = lifelikeResistorImageNode.width / ieeeSchematicShape.bounds.width;
    ieeeSchematicShape = ieeeSchematicShape.transformed( Matrix3.scale( scale, scale ) );
    const offsetX = ieeeSchematicShape.bounds.minX;
    const offsetY = ieeeSchematicShape.bounds.minY;
    ieeeSchematicShape = ieeeSchematicShape.transformed( Matrix3.translation( -offsetX, -offsetY ) );

    // IEC Resistor: it is a box with a left horizontal lead and a right horizontal lead
    const boxHeight = 30;
    const boxLength = 70;
    let iecSchematicShape = new Shape()
      .moveTo( 0, boxHeight / 2 )

      // left horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // upper half of the box
      .lineToRelative( 0, -boxHeight / 2 )
      .lineToRelative( boxLength, 0 )
      .lineToRelative( 0, boxHeight / 2 )

      // right horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // go back along the right horizontal lead
      .lineToRelative( -SCHEMATIC_STEM_WIDTH, 0 )

      // lower half of the box
      .lineToRelative( 0, boxHeight / 2 )
      .lineToRelative( -boxLength, 0 )
      .lineToRelative( 0, -boxHeight / 2 );

    scale = lifelikeResistorImageNode.width / iecSchematicShape.bounds.width;
    iecSchematicShape = iecSchematicShape.transformed( Matrix3.scale( scale, scale ) );

    const schematicNode = new Path( ieeeSchematicShape, {
      stroke: Color.BLACK,
      lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
    } );

    const updateSchematicType = ( schematicType: SchematicType ) => {
      schematicNode.shape = schematicType === SchematicType.IEEE ? ieeeSchematicShape :
                            iecSchematicShape;
    };
    schematicTypeProperty.link( updateSchematicType );

    schematicNode.mouseArea = schematicNode.localBounds;
    schematicNode.touchArea = schematicNode.localBounds;

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    schematicNode.centerY = 0;
    lifelikeResistorImageNode.centerY = 0;

    lifelikeResistorImageNode.translate( 0, resistor.resistorType.verticalOffset );

    // Super call
    super(
      screenView,
      circuitNode,
      resistor,
      viewTypeProperty,
      lifelikeResistorImageNode,
      schematicNode,
      tandem,
      providedOptions
    );

    this.resistor = resistor;

    this.lifelikeResistorImageNode = lifelikeResistorImageNode;

    this.disposeResistorNode = () => {
      updateColorBands && resistor.resistanceProperty.unlink( updateColorBands );
      lifelikeResistorImageNode.dispose();
      schematicTypeProperty.unlink( updateSchematicType );
      colorBandsNode && colorBandsNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeResistorNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'ResistorNode', ResistorNode );