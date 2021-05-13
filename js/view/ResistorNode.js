// Copyright 2015-2020, University of Colorado Boulder

/**
 * This node shows a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import coinImage from '../../images/coin_png.js';
import dogImage from '../../images/dog_png.js';
import dollarBillImage from '../../images/dollar-bill_png.js';
import eraserImage from '../../images/eraser_png.js';
import handImage from '../../images/hand_png.js';
import paperClipImage from '../../images/paper-clip_png.js';
import pencilImage from '../../images/pencil_png.js';
import resistorHighImage from '../../images/resistor-high_png.js';
import resistorImage from '../../images/resistor_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Resistor from '../model/Resistor.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import ResistorColors from './ResistorColors.js';
import SchematicType from './SchematicType.js';
import schematicTypeProperty from './schematicTypeProperty.js';

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

const RESISTOR_IMAGE_MAP = {};
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.COIN ] = coinImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.PAPER_CLIP ] = paperClipImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.PENCIL ] = pencilImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.ERASER ] = eraserImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.HAND ] = handImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR ] = resistorHighImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.RESISTOR ] = resistorImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.DOG ] = dogImage;
RESISTOR_IMAGE_MAP[ Resistor.ResistorType.DOLLAR_BILL ] = dollarBillImage;

class ResistorNode extends FixedCircuitElementNode {

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for isIcon
   * @param {Resistor} resistor
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenView, circuitLayerNode, resistor, viewTypeProperty, tandem, options ) {

    options = merge( { isIcon: false, useHitTestForSensors: true }, options );

    // Assigned to instance variable after super()
    const lifelikeResistorImageNode = new Image( RESISTOR_IMAGE_MAP[ resistor.resistorType ] );

    let updateColorBands = null;

    // Add color bands for the normal resistor
    if ( resistor.resistorType === Resistor.ResistorType.RESISTOR ) {

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
       * @param {number} resistance
       */
      updateColorBands = resistance => {
        const colors = ResistorColors.getColorArray( resistance );

        if ( colors.length === 1 ) {
          singleColorBand.fill = colors[ 0 ];
          assert && assert( colors[ 0 ].equals( Color.BLACK ), 'single band should be black' );
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
      colorBands.forEach( colorBand => lifelikeResistorImageNode.addChild( colorBand ) );
      lifelikeResistorImageNode.addChild( singleColorBand );
    }

    // Icons should appear the same in the toolbox, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/389
    const width = options.isIcon ? CCKCConstants.RESISTOR_LENGTH : resistor.distanceBetweenVertices;
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

    const updateSchematicType = schematicType => {
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
      circuitLayerNode,
      resistor,
      viewTypeProperty,
      lifelikeResistorImageNode,
      schematicNode,
      tandem,
      options
    );

    // @public (read-only) {Resistor} the resistor depicted by this node
    this.resistor = resistor;

    // @protected {Image}
    this.lifelikeResistorImageNode = lifelikeResistorImageNode;

    /**
     * @private {function} - dispose the resistor node
     */
    this.disposeResistorNode = () => {
      updateColorBands && resistor.resistanceProperty.unlink( updateColorBands );
      lifelikeResistorImageNode.dispose();
      schematicTypeProperty.unlink( updateSchematicType );
    };
  }

  /**
   * Dispose the ResistorNode when it will no longer be used.
   * @public
   * @override
   */
  dispose() {
    this.disposeResistorNode();
    super.dispose();
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
ResistorNode.webglSpriteNodes = [
  new Image( resistorImage ),
  new Image( paperClipImage ),
  new Image( coinImage ),
  new Image( pencilImage ),
  new Image( eraserImage ),
  new Image( handImage ),
  new Image( resistorHighImage ),
  new Image( dogImage ),
  new Image( dollarBillImage )
];

circuitConstructionKitCommon.register( 'ResistorNode', ResistorNode );
export default ResistorNode;