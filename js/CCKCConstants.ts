// Copyright 2015-2023, University of Colorado Boulder

/**
 * Constants used in all of the Circuit Construction Kit sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import CCKCQueryParameters from './CCKCQueryParameters.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';

// constants
const FONT_SIZE = 14;

// constants
const CCKCConstants = {

  // Run a paused clock at this rate, see https://github.com/phetsims/circuit-construction-kit-common/issues/572
  // and refined in https://github.com/phetsims/circuit-construction-kit-common/issues/772
  // Still need physics to update, like capacitors clearing and electrons updating.  But don't propagate time very far!
  PAUSED_DT: 1E-6,

  // Available scale factors for the sim stage
  ZOOM_SCALES: [ 0.5, 1, 1.6 ],

  // When trying to drop an item back in the toolbox, this is the proportion of its width and height used for the hit box
  RETURN_ITEM_HIT_BOX_RATIO: 0.2,

  // Maximum size for Width or height of icons in the circuit element toolbox or sensor toolbox
  TOOLBOX_ICON_HEIGHT: 31,
  TOOLBOX_ICON_WIDTH: 60,

  // The number of decimal points to display on the voltmeter and ammeter readings
  METER_PRECISION: 2,

  // The resistance of a default resistor, also used in icons
  DEFAULT_RESISTANCE: 10,

  // The default capacitance in farads
  DEFAULT_CAPACITANCE: 0.1,

  // The resistance of a default battery
  DEFAULT_BATTERY_RESISTANCE: CCKCQueryParameters.batteryMinimumResistance,

  // The range of the battery resistance
  BATTERY_RESISTANCE_RANGE: new Range( CCKCQueryParameters.batteryMinimumResistance, 10 ),

  // Right side panel minWidth
  RIGHT_SIDE_PANEL_MIN_WIDTH: 190,

  // Padding for placement of control panels
  VERTICAL_MARGIN: 5,
  HORIZONTAL_MARGIN: 10,

  // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
  TAP_THRESHOLD: 15,

  // Dimensions of track size found in sliders
  SLIDER_TRACK_SIZE: new Dimension2( 160, 5 ),

  // Uniform scaling for all font awesome node button icons
  FONT_AWESOME_ICON_SCALE: 0.07,

  // Line width for highlighting for selected objects
  HIGHLIGHT_LINE_WIDTH: 5,

  // Default resistivity for Wires and Switches (whose resistance varies with length)
  // R = rho * L / A.  Resistance = resistivity * Length / cross sectional area.
  // https://en.wikipedia.org/wiki/Electrical_resistivity_and_conductivity says copper has rho=1.68E-8 Ohm * m
  // According to http://www.sengpielaudio.com/calculator-cross-section.htm AWG Wire Gauge of 20 has 0.52mm^2 = 5.2e-7m^2
  // Maximum is large enough so that max resistance in a 9v battery slows to a good rate
  WIRE_RESISTIVITY_RANGE: new Range( CCKCQueryParameters.wireResistivity, 0.0168 ), // Ohm * m

  WIRE_CROSS_SECTIONAL_AREA: 5E-4, // meters squared

  // Lowest resistance a wire can have
  MINIMUM_WIRE_RESISTANCE: 1E-14,

  // The lowest resistance other CircuitElements can have. This is the resistance of a wire the same length as a resistor
  MINIMUM_RESISTANCE: 1.1E-10,

  // How far to erode the visible bounds for keeping the probes in bounds.
  DRAG_BOUNDS_EROSION: 20,

  // Distance between adjacent charges within a circuit element
  CHARGE_SEPARATION: 28,
  
  // Length of a battery
  BATTERY_LENGTH: 102,

  // Length of the AC Voltage
  AC_VOLTAGE_LENGTH: 68,

  // Length of a switch, not so wide that electrons appear in the notches
  SWITCH_LENGTH: 112,

  SWITCH_START: 1 / 3, // fraction along the switch to the pivot
  SWITCH_END: 2 / 3, // fraction along the switch to the connection point

  // Length of a resistor
  RESISTOR_LENGTH: 110,

  FUSE_LENGTH: 110,
  WIRE_LENGTH: 100,

  CAPACITOR_LENGTH: 110,

  INDUCTOR_LENGTH: 110,

  // Length of household items in view coordinates
  COIN_LENGTH: 85,
  ERASER_LENGTH: 90,
  PENCIL_LENGTH: 130,
  HAND_LENGTH: 140,
  DOG_LENGTH: 170,
  DOLLAR_BILL_LENGTH: 140,
  PAPER_CLIP_LENGTH: 75,

  // Length
  SERIES_AMMETER_LENGTH: 121,

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

  THUMB_SIZE: new Dimension2( 13, 24 ),

  MAJOR_TICK_LENGTH: 18,
  MINOR_TICK_LENGTH: 12,

  // The main font size to use for labels and controls
  FONT_SIZE: FONT_SIZE,

  DEFAULT_FONT: new PhetFont( FONT_SIZE ),

  // Number of wires that can be dragged out of the toolbox
  NUMBER_OF_WIRES: 50,

  // The number of gridlines in the charts that indicate the progression of time.
  NUMBER_OF_TIME_DIVISIONS: 4,

  CHART_SERIES_COLOR: '#404041',

  DC_CAROUSEL_SCALE: 1.2,

  AC_CAROUSEL_SCALE: 0.85,

  MAX_DT: 0.5 // see https://github.com/phetsims/circuit-construction-kit-common/issues/476 and https://github.com/phetsims/joist/issues/130
};

circuitConstructionKitCommon.register( 'CCKCConstants', CCKCConstants );

export default CCKCConstants;