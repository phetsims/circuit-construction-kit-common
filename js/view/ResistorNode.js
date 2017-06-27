// Copyright 2015-2017, University of Colorado Boulder

/**
 * This node shows a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorColors' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Color = require( 'SCENERY/util/Color' );
  var Matrix3 = require( 'DOT/Matrix3' );

  // images
  var lifelikeResistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor.png' );
  var paperClipImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/paper-clip.png' );
  var coinImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin.png' );
  var pencilImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil.png' );
  var eraserImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser.png' );
  var handImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand.png' );
  var highResistanceResistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor_high.png' );
  var dogImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog.png' );
  var dollarBillImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollar_bill.png' );

  // constants
  var LIFELIKE_IMAGE_SCALE = 1.0;
  var LIFELIKE_IMAGE_WIDTH = lifelikeResistorImage[ 0 ].width / LIFELIKE_IMAGE_SCALE;
  var COLOR_BAND_WIDTH = 10;
  var COLOR_BAND_HEIGHT = 39.75;
  var COLOR_BAND_TOP = -0.25;
  var COLOR_BAND_PADDING = 33;
  var AVAILABLE_COLOR_BAND_SPACE = LIFELIKE_IMAGE_WIDTH - 2 * COLOR_BAND_PADDING;
  var REMAINING_COLOR_BAND_SPACE = AVAILABLE_COLOR_BAND_SPACE - 4 * COLOR_BAND_WIDTH;// max is 4 bands, even though they are not always shown
  var COLOR_BAND_SPACING = REMAINING_COLOR_BAND_SPACE / 4 - 2; // two spaces before last band
  var COLOR_BAND_Y = lifelikeResistorImage[ 0 ].height / 2 / LIFELIKE_IMAGE_SCALE - COLOR_BAND_HEIGHT / LIFELIKE_IMAGE_SCALE / 2 + COLOR_BAND_TOP;

  // Points sampled using Photoshop from a raster of the IEEE icon seen at https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
  var SCHEMATIC_SCALE = 0.54;
  var SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
  var SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
  var SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitLayerNode} [circuitLayerNode] optional, null for icons
   * @param {Resistor} resistor
   * @param {Property.<boolean>} showResultsProperty - not used here but appears in signature to keep same signature as other CircuitElementNode subclasses.
   * @param {Property.<string>} viewProperty - 'lifelike' or 'schematic'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function ResistorNode( circuitConstructionKitScreenView, circuitLayerNode, resistor, showResultsProperty, viewProperty, tandem, options ) {

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
    else if ( resistor.resistorType === 'high-resistance-resistor' ) {
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
          assert && assert( colors[ 0 ].equals( new Color( 'black' ) ), 'single band should be black' );
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

    lifelikeResistorImageNode.mutate( {
      scale: resistor.distanceBetweenVertices / lifelikeResistorImageNode.width
    } );
    var scale = lifelikeResistorImageNode.width / schematicShape.bounds.width;
    schematicShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
    var schematicNode = new Path( schematicShape, {
      stroke: 'black',
      lineWidth: CircuitConstructionKitConstants.SCHEMATIC_LINE_WIDTH
    } ).toDataURLNodeSynchronous();

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy();
    schematicNode.touchArea = schematicNode.bounds.copy();

    // Center vertically to match the FixedLengthCircuitElementNode assumption that origin is center left
    schematicNode.centerY = 0;
    lifelikeResistorImageNode.centerY = 0;

    // Adjust the dog so the electrons travel along the tail/legs, see https://github.com/phetsims/circuit-construction-kit-common/issues/364
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
      viewProperty,
      lifelikeResistorImageNode,
      schematicNode,
      tandem,
      options
    );

    /**
     * @private - dispose the resistor node
     */
    this.disposeResistorNode = function() {
      resistor.resistanceProperty.unlink( updateColorBands );
      lifelikeResistorImageNode.children = [];
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
     */
    dispose: function() {
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
      this.children = [];
      this.disposeResistorNode();
    }
  }, {

    // TODO: docs
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