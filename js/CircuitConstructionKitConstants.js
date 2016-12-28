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
    TOOLBOX_ICON_SIZE: 60, // Maximum size for Width or height of icons in the circuit element toolbox or sensor toolbox
    TOOLBOX_ITEM_SPACING: 30, // Spacing between adjacent items in the circuit element toolbox or sensor toolbox
    DEFAULT_RESISTANCE: 4.5, // The resistance of a default resistor, also used in icons
    LAYOUT_INSET: 14, // Padding for placement of control panels
    TAP_THRESHOLD: 10, // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
    FONT_AWESOME_ICON_SCALE: 0.85, // Uniform scaling for all font awesome node button icons
    HIGHLIGHT_COLOR: new Color( 'yellow' ), // Color for selected objects (CircuitElement and Vertex)
    HIGHLIGHT_LINE_WIDTH: 5, // Line width for highlighting for selected objects
    DEFAULT_RESISTIVITY: 1E-4, // Default resistivity for Wires and Switches (whose resistance varies with length)
    MINIMUM_RESISTANCE: 1E-8, // The lowest resistance a Wire or Switch can have
    DRAG_BOUNDS_EROSION: 10, // How far to erode the visible bounds for keeping the probes in bounds.
    ELECTRON_SEPARATION: 28, // Distance between adjacent electrons for electron layout
    BACKGROUND_COLOR: new Color( '#c6dbf9' ) // Color of the background
  } );
} );