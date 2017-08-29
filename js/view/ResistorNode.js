// Copyright 2015-2017, University of Colorado Boulder

/**
 * This node shows a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorColors' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );

  // images
  var coinImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin.png' );
  var dogImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog.png' );
  var dollarBillImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollar-bill.png' );
  var eraserImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser.png' );
  var handImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand.png' );
  var paperClipImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/paper-clip.png' );
  var pencilImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil.png' );
  var highResistanceResistorImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor-high.png' );
  var lifelikeResistorImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor.png' );

  // constants

  // hard coded because Image.width and Image.initialWidth sometimes return bad values in the built version
  var LIFELIKE_IMAGE_WIDTH = 150;
  var COLOR_BAND_WIDTH = 10;
  var COLOR_BAND_HEIGHT = 39.75;
  var COLOR_BAND_TOP = -0.25;
  var COLOR_BAND_PADDING = 33;
  var AVAILABLE_COLOR_BAND_SPACE = LIFELIKE_IMAGE_WIDTH - 2 * COLOR_BAND_PADDING;

  // max is 4 bands, even though they are not always shown
  var REMAINING_COLOR_BAND_SPACE = AVAILABLE_COLOR_BAND_SPACE - 4 * COLOR_BAND_WIDTH;
  var COLOR_BAND_SPACING = REMAINING_COLOR_BAND_SPACE / 4 - 2; // two spaces before last band
  var COLOR_BAND_Y = COLOR_BAND_TOP + 2.5;

  // Points sampled using Photoshop from a raster of the IEEE icon seen at
  // https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
  var SCHEMATIC_SCALE = 0.54;
  var SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
  var SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
  var SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

  // cache the rasters so they aren't added to the spritesheet multiple times
  var schematicRasterCache = {};

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Resistor} resistor
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function ResistorNode( circuitConstructionKitScreenView, circuitLayerNode, resistor, viewTypeProperty, tandem, options ) {

    options = _.extend( { icon: false }, options );

    // @public (read-only) {Resistor} the resistor depicted by this node
    this.resistor = resistor;

    var lifelikeResistorImageNode = new Image( lifelikeResistorImage );

    if ( resistor.resistorType === 'coin' ) {
      lifelikeResistorImageNode = new Image( coinImage );
    }
    else if ( resistor.resistorType === 'paperClip' ) {
      lifelikeResistorImageNode = new Image( paperClipImage );
    }
    else if ( resistor.resistorType === 'pencil' ) {
      lifelikeResistorImageNode = new Image( pencilImage );
    }
    else if ( resistor.resistorType === 'eraser' ) {
      lifelikeResistorImageNode = new Image( eraserImage );
    }
    else if ( resistor.resistorType === 'hand' ) {
      lifelikeResistorImageNode = new Image( handImage );
    }
    else if ( resistor.resistorType === 'highResistanceResistor' ) {
      lifelikeResistorImageNode = new Image( highResistanceResistorImage );
    }
    else if ( resistor.resistorType === 'dog' ) {
      lifelikeResistorImageNode = new Image( dogImage );
    }
    else if ( resistor.resistorType === 'dollarBill' ) {
      lifelikeResistorImageNode = new Image( dollarBillImage );
    }
    else {

      /**
       * Get a color band for the given index.
       * @param {number} index
       * @returns {Rectangle}
       */
      var getColorBand = function( index ) {

        var additionalOffset = index === 3 ? 12 : 0;
        return new Rectangle( 0, 0, COLOR_BAND_WIDTH, COLOR_BAND_HEIGHT, {
          x: COLOR_BAND_PADDING + (COLOR_BAND_WIDTH + COLOR_BAND_SPACING) * index + additionalOffset,
          y: COLOR_BAND_Y
        } );
      };

      // Color bands for resistance > 0
      var colorBands = _.range( 4 ).map( getColorBand );

      // Single color band when resistance = 0 which appears in the middle
      var singleColorBand = new Rectangle( 0, 0, COLOR_BAND_WIDTH, COLOR_BAND_HEIGHT, {
        centerX: COLOR_BAND_PADDING + AVAILABLE_COLOR_BAND_SPACE / 2,
        y: COLOR_BAND_Y
      } );

      /**
       * When the resistance changes, update the colors of the color bands.
       * @param resistance
       */
      var updateColorBands = function( resistance ) {
        var colors = ResistorColors.getColorArray( resistance );

        if ( colors.length === 1 ) {
          singleColorBand.fill = colors[ 0 ];
          assert && assert( colors[ 0 ].equals( Color.BLACK ), 'single band should be black' );
          colorBands.forEach( function( colorBand ) { colorBand.fill = null; } );
        }
        else {

          // Show all 4 colors bands and hide the 0-resistance band
          singleColorBand.fill = null;
          for ( var i = 0; i < colorBands.length; i++ ) {
            colorBands[ i ].fill = colors[ i ] || null;// Last one could be null
          }
        }
      };
      resistor.resistanceProperty.link( updateColorBands );

      // Add the color bands to the resistor image
      colorBands.forEach( function( colorBand ) {
        lifelikeResistorImageNode.addChild( colorBand );
      } );
      lifelikeResistorImageNode.addChild( singleColorBand );
    }

    // Classical zig-zag shape
    var schematicShape = new Shape()
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
    var width = options.icon ? CircuitConstructionKitCommonConstants.RESISTOR_LENGTH : resistor.distanceBetweenVertices;
    lifelikeResistorImageNode.mutate( {
      scale: width / lifelikeResistorImageNode.width
    } );

    var scale = lifelikeResistorImageNode.width / schematicShape.bounds.width;
    schematicShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
    var schematicNode = null;
    if ( !options.icon && schematicRasterCache[ resistor.resistorType ] ) {
      schematicNode = schematicRasterCache[ resistor.resistorType ];
    }
    else {
      schematicNode = new Path( schematicShape, {
        stroke: Color.BLACK,
        lineWidth: CircuitConstructionKitCommonConstants.SCHEMATIC_LINE_WIDTH
      } ).toDataURLImageSynchronous();

      // icons are all the same size in the toolbox, so only cache the non-icons (with the correct heights)
      if ( !options.icon ) {
        schematicRasterCache[ resistor.resistorType ] = schematicNode;
      }
    }

    // Center vertically to match the FixedLengthCircuitElementNode assumption that origin is center left
    schematicNode.centerY = 0;
    lifelikeResistorImageNode.centerY = 0;

    // Expand the pointer areas with a defensive copy, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy().shiftedY( schematicNode.height / 2 );
    schematicNode.touchArea = schematicNode.bounds.copy().shiftedY( schematicNode.height / 2 );

    // Adjust the dog so the charges travel along the tail/legs, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/364
    if ( resistor.resistorType === 'dog' ) {
      lifelikeResistorImageNode.translate( 0, -40 );
    }

    // Adjust hand origin as well
    if ( resistor.resistorType === 'hand' ) {
      lifelikeResistorImageNode.translate( 0, 14 );
    }

    // Super call
    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitLayerNode,
      resistor,
      viewTypeProperty,
      lifelikeResistorImageNode,
      schematicNode,
      tandem,
      options
    );

    /**
     * @private - dispose the resistor node
     */
    this.disposeResistorNode = function() {
      updateColorBands && resistor.resistanceProperty.unlink( updateColorBands );
      lifelikeResistorImageNode.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'ResistorNode', ResistorNode );

  return inherit( FixedLengthCircuitElementNode, ResistorNode, {

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint: function( point ) {

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
    },

    /**
     * Dispose the ResistorNode when it will no longer be used.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeResistorNode();
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [
      new Image( lifelikeResistorImage ),
      new Image( paperClipImage ),
      new Image( coinImage ),
      new Image( pencilImage ),
      new Image( eraserImage ),
      new Image( handImage ),
      new Image( highResistanceResistorImage ),
      new Image( dogImage ),
      new Image( dollarBillImage )
    ]
  } );
} );