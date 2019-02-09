// Copyright 2015-2017, University of Colorado Boulder

/**
 * This node shows a resistor.
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
  const Matrix3 = require( 'DOT/Matrix3' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorColors' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const Shape = require( 'KITE/Shape' );

  // images
  const coinImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin.png' );
  const dogImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog.png' );
  const dollarBillImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollar-bill.png' );
  const eraserImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser.png' );
  const handImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand.png' );
  const highResistanceResistorImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor-high.png' );
  const lifelikeResistorImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor.png' );
  const paperClipImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/paper-clip.png' );
  const pencilImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil.png' );

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

  // cache the rasters so they aren't added to the spritesheet multiple times
  const schematicRasterCache = {};

  const RESISTOR_IMAGE_MAP = {};
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.COIN ] = coinImage;
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.PAPER_CLIP ] = paperClipImage;
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.PENCIL ] = pencilImage;
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.ERASER ] = eraserImage;
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.HAND ] = handImage;
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR ] = highResistanceResistorImage;
  RESISTOR_IMAGE_MAP[ Resistor.ResistorType.RESISTOR ] = lifelikeResistorImage;
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

      options = _.extend( { isIcon: false }, options );

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

      // Classical zig-zag shape
      let schematicShape = new Shape()
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

      // Icons should appear the same in the toolbox, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/389
      const width = options.isIcon ? CCKCConstants.RESISTOR_LENGTH : resistor.distanceBetweenVertices;
      lifelikeResistorImageNode.mutate( {
        scale: width / lifelikeResistorImageNode.width
      } );

      const scale = lifelikeResistorImageNode.width / schematicShape.bounds.width;
      schematicShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
      let schematicNode = null;
      if ( !options.isIcon && schematicRasterCache[ resistor.resistorType ] ) {
        schematicNode = schematicRasterCache[ resistor.resistorType ];
      }
      else {
        schematicNode = new Path( schematicShape, {
          stroke: Color.BLACK,
          lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
        } ).toDataURLImageSynchronous();

        // icons are all the same size in the toolbox, so only cache the non-icons (with the correct heights)
        if ( !options.isIcon ) {
          schematicRasterCache[ resistor.resistorType ] = schematicNode;
        }
      }

      // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
      schematicNode.centerY = 0;
      lifelikeResistorImageNode.centerY = 0;

      // Expand the pointer areas with a defensive copy, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/310
      schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
      schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

      // Adjust the dog so the charges travel along the tail/legs, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/364
      if ( resistor.resistorType === Resistor.ResistorType.DOG ) {
        lifelikeResistorImageNode.translate( 0, -40 );
      }

      // Adjust hand origin as well
      if ( resistor.resistorType === Resistor.ResistorType.HAND ) {
        lifelikeResistorImageNode.translate( 0, 14 );
      }

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

      /**
       * @private {function} - dispose the resistor node
       */
      this.disposeResistorNode = () => {
        updateColorBands && resistor.resistanceProperty.unlink( updateColorBands );
        lifelikeResistorImageNode.dispose();
      };
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
    new Image( lifelikeResistorImage ),
    new Image( paperClipImage ),
    new Image( coinImage ),
    new Image( pencilImage ),
    new Image( eraserImage ),
    new Image( handImage ),
    new Image( highResistanceResistorImage ),
    new Image( dogImage ),
    new Image( dollarBillImage )
  ];

  return circuitConstructionKitCommon.register( 'ResistorNode', ResistorNode );
} );