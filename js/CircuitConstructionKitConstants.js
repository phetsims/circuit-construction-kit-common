// Copyright 2015-2016, University of Colorado Boulder

/**
 * Constants used in all of the Circuit Construction Kit sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Range = require( 'DOT/Range' );

  /**
   * @constructor
   */
  function CircuitConstructionKitConstants() {
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitConstants', CircuitConstructionKitConstants );

  return inherit( Object, CircuitConstructionKitConstants, {}, {

    // Maximum size for Width or height of icons in the circuit element toolbox or sensor toolbox
    TOOLBOX_ICON_SIZE: 60,

    // Spacing between adjacent items in the circuit element toolbox or sensor toolbox
    TOOLBOX_ITEM_SPACING: 30,

    // The resistance of a default resistor, also used in icons
    DEFAULT_RESISTANCE: 10,

    // The resistance of a default battery
    DEFAULT_BATTERY_RESISTANCE: 0,

    // Right side panel minWidth
    RIGHT_SIDE_PANEL_MIN_WIDTH: 190,

    // Padding for placement of control panels
    VERTICAL_MARGIN: 5,

    // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
    TAP_THRESHOLD: 15,

    // Dimensions of track size found in sliders
    SLIDER_TRACK_SIZE: new Dimension2( 160, 5 ),

    // Uniform scaling for all font awesome node button icons
    FONT_AWESOME_ICON_SCALE: 0.85,

    // Color for selected objects (CircuitElement and Vertex)
    HIGHLIGHT_COLOR: new Color( 'yellow' ),

    // Line width for highlighting for selected objects
    HIGHLIGHT_LINE_WIDTH: 5,

    // Default resistivity for Wires and Switches (whose resistance varies with length)
    DEFAULT_RESISTIVITY: 1E-4,

    // The lowest resistance a Wire or Switch can have
    MINIMUM_RESISTANCE: 1E-8,

    // How far to erode the visible bounds for keeping the probes in bounds.
    DRAG_BOUNDS_EROSION: 20,

    // Distance between adjacent charges within a circuit element
    CHARGE_SEPARATION: 28,

    // Color of the background
    BACKGROUND_COLOR: new Color( '#99c1ff' ),

    // Length of a battery
    BATTERY_LENGTH: 102,

    // Length of a switch, not so wide that electrons appear in the notches
    SWITCH_LENGTH: 112,

    SWITCH_START: 1 / 3, // fraction along the switch to the pivot
    SWITCH_END: 2 / 3, // fraction along the switch to the connection point

    // Length of a resistor
    RESISTOR_LENGTH: 110,

    // Length of grab bag items in view coordinates
    COIN_LENGTH: 85,
    ERASER_LENGTH: 90,
    PENCIL_LENGTH: 130,
    HAND_LENGTH: 140,
    DOG_LENGTH: 170,
    DOLLAR_BILL_LENGTH: 140,
    PAPER_CLIP_LENGTH: 75,

    // Length
    SERIES_AMMETER_LENGTH: 121,

    // background for panels and radio buttons
    PANEL_COLOR: '#f1f1f2',

    // radius for panels and radio buttons
    CORNER_RADIUS: 6,

    // Line width for schematic view
    SCHEMATIC_LINE_WIDTH: 4,

    // The maximum resistance any circuit element can have.  An open switch is modeled as a high-resistance resistor
    MAX_RESISTANCE: 1000000000,

    // scale applied to the light bulb view
    BULB_SCALE: 2.52,

    // tweaker amount for the high resistance or high voltage components
    HIGH_EDITOR_DELTA: 100,

    // default resistance for the high resistance light bulb or high resistance resistor
    HIGH_RESISTANCE: 1000,

    HIGH_RESISTANCE_RANGE: new Range( 100, 10000 ),

    PANEL_LINE_WIDTH: 1.3,

    THUMB_SIZE: new Dimension2( 18, 34 ),

    MAJOR_TICK_LENGTH: 20
  } );
} );