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
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ResistorColors' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // images
  var lifelikeResistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor.png' );

  // constants
  var LIFELIKE_IMAGE_SCALE = 0.7;
  var LIFELIKE_IMAGE_WIDTH = lifelikeResistorImage[ 0 ].width / LIFELIKE_IMAGE_SCALE;
  var COLOR_BAND_WIDTH = 10;
  var COLOR_BAND_HEIGHT = 34;
  var COLOR_BAND_TOP = -2; // Account for vertical asymmetry in the image
  var COLOR_BAND_INSET = 40;
  var AVAILABLE_COLOR_BAND_SPACE = LIFELIKE_IMAGE_WIDTH * 0.75 - 2 * COLOR_BAND_INSET;
  var REMAINING_COLOR_BAND_SPACE = AVAILABLE_COLOR_BAND_SPACE - 4 * COLOR_BAND_WIDTH;// max is 4 bands, even though they are not always shown
  var COLOR_BAND_SPACING = REMAINING_COLOR_BAND_SPACE / 4; // two spaces before last band
  var COLOR_BAND_Y = lifelikeResistorImage[ 0 ].height / 2 / LIFELIKE_IMAGE_SCALE - COLOR_BAND_HEIGHT / LIFELIKE_IMAGE_SCALE / 2 + COLOR_BAND_TOP;

  // Points sampled using Photoshop from a raster of the IEEE icon seen at https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
  var SCHEMATIC_SCALE = 0.54;
  var SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
  var SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
  var SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;
  var SCHEMATIC_LINE_WIDTH = 6;

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} [circuitNode] optional, null for icons
   * @param {Resistor} resistor
   * @param {Property.<boolean>} runningProperty - not used here but appears in signature to keep same signature as other CircuitElementNode subclasses.
   * @param {Property.<string>} viewProperty - 'lifelike' or 'schematic'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function ResistorNode( circuitConstructionKitScreenView, circuitNode, resistor, runningProperty, viewProperty, tandem, options ) {

    // @public (read-only) the resistor depicted by this node
    this.resistor = resistor;

    var lifelikeResistorImageNode = new Image( lifelikeResistorImage );

    /**
     * Get a color band for the given index.
     * @param {number} index
     * @returns {Rectangle}
     */
    var getColorBand = function( index ) {

      // TODO: why is the last band offset vertically?
      var additionalHeight = index === 3 ? 3 : 0;
      return new Rectangle( 0, 0, COLOR_BAND_WIDTH, COLOR_BAND_HEIGHT + additionalHeight, {
        x: COLOR_BAND_INSET + (COLOR_BAND_WIDTH + COLOR_BAND_SPACING) * index,
        y: COLOR_BAND_Y - additionalHeight / 2
      } );
    };

    var colorBands = _.range( 4 ).map( getColorBand );

    /**
     * When the resistance changes, update the colors of the color bands.
     * @param resistance
     */
    var updateColorBands = function( resistance ) {
      var colors = ResistorColors.getColorArray( resistance );
      for ( var i = 0; i < colorBands.length; i++ ) {
        colorBands[ i ].fill = colors[ i ];// Last one could be null
      }
    };
    resistor.resistanceProperty.link( updateColorBands );

    // Add the color bands to the resistor image
    colorBands.forEach( function( colorBand ) {
      lifelikeResistorImageNode.addChild( colorBand );
    } );

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
    var schematicPathNode = new Path( schematicShape, { stroke: 'black', lineWidth: SCHEMATIC_LINE_WIDTH } );

    // Super call
    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitNode,
      resistor,
      viewProperty,
      lifelikeResistorImageNode,
      schematicPathNode,
      LIFELIKE_IMAGE_SCALE,
      tandem,
      options
    );

    /**
     * @private - dispose the resistor node
     */
    this.disposeResistorNode = function() {
      resistor.resistanceProperty.unlink( updateColorBands );
    };
  }

  circuitConstructionKitCommon.register( 'ResistorNode', ResistorNode );

  return inherit( FixedLengthCircuitElementNode, ResistorNode, {

    /**
     * Dispose the ResistorNode when it will no longer be used.
     * @public
     */
    dispose: function() {
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
      this.disposeResistorNode();
    }
  } );
} );