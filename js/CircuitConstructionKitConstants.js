// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Constants used in all of the sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   * @constructor
   */
  function CircuitConstructionKitConstants() {
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitConstants', CircuitConstructionKitConstants );

  return inherit( Object, CircuitConstructionKitConstants, {}, {
    TOOLBOX_ICON_LENGTH: 60, // Width or height for icons in the control panel
    TOOLBOX_ITEM_SPACING: 30,
    SOLDER_COLOR: '#ae9f9e',
    DEFAULT_RESISTANCE: 4.5,
    LAYOUT_INSET: 14,
    TAP_THRESHOLD: 10, // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
    FONT_AWESOME_ICON_SCALE: 0.85, // Uniform scaling for all font awesome node button icons
    HIGHLIGHT_COLOR: 'yellow',
    HIGHLIGHT_LINE_WIDTH: 5,
    DEFAULT_RESISTIVITY: 1E-4,
    MINIMUM_RESISTANCE: 1E-8,
    DRAG_BOUNDS_EROSION: 10, // How far to erode the visible bounds for keeping the probes in bounds.
    ELECTRON_SEPARATION: 28,
    BACKGROUND_COLOR: new Color( '#c6dbf9' )
  } );
} );