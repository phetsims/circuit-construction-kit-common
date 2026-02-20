// Copyright 2015-2026, University of Colorado Boulder

/**
 * Constants used in all of the Circuit Construction Kit sims/screens/scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import { type CreditsData } from '../../joist/js/CreditsNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import CCKCQueryParameters from './CCKCQueryParameters.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';

// constants
const FONT_SIZE = 14;

// constants
export default class CCKCConstants {

  // Run a paused clock at this rate, see https://github.com/phetsims/circuit-construction-kit-common/issues/572
  // and refined in https://github.com/phetsims/circuit-construction-kit-common/issues/772
  // Still need physics to update, like capacitors clearing and electrons updating.  But don't propagate time very far!
  public static readonly PAUSED_DT = 1E-6;

  // Available scale factors for the sim stage
  public static readonly ZOOM_SCALES = [ 0.5, 1, 1.6 ];

  // When trying to drop an item back in the toolbox, this is the proportion of its width and height used for the hit box
  public static readonly RETURN_ITEM_HIT_BOX_RATIO = 0.2;

  // Maximum size for Width or height of icons in the circuit element toolbox or sensor toolbox
  public static readonly TOOLBOX_ICON_HEIGHT = 31;
  public static readonly TOOLBOX_ICON_WIDTH = 60;

  // The number of decimal points to display on the voltmeter and ammeter readings
  public static readonly METER_PRECISION = 2;

  // The resistance of a default resistor, also used in icons
  public static readonly DEFAULT_RESISTANCE = 10;

  // The default capacitance in farads
  public static readonly DEFAULT_CAPACITANCE = 0.1;

  // The resistance of a default battery
  public static readonly DEFAULT_BATTERY_RESISTANCE = CCKCQueryParameters.batteryMinimumResistance;

  // The range of the battery resistance
  public static readonly BATTERY_RESISTANCE_RANGE = new Range( CCKCQueryParameters.batteryMinimumResistance, 10 );

  // Right side panel minWidth
  public static readonly RIGHT_SIDE_PANEL_MIN_WIDTH = 190;

  // Padding for placement of control panels
  public static readonly VERTICAL_MARGIN = 5;
  public static readonly HORIZONTAL_MARGIN = 10;

  // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
  public static readonly TAP_THRESHOLD = 15;

  // Dimensions of track size found in sliders
  public static readonly SLIDER_TRACK_SIZE = new Dimension2( 160, 5 );

  // Uniform scaling for all font awesome node button icons
  public static readonly FONT_AWESOME_ICON_SCALE = 0.07;

  // Line width for highlighting for selected objects
  public static readonly HIGHLIGHT_LINE_WIDTH = 5;

  // Default resistivity for Wires and Switches (whose resistance varies with length)
  // R = rho * L / A.  Resistance = resistivity * Length / cross-sectional area.
  // https://en.wikipedia.org/wiki/Electrical_resistivity_and_conductivity says copper has rho=1.68E-8 Ohm * m
  // According to http://www.sengpielaudio.com/calculator-cross-section.htm AWG Wire Gauge of 20 has 0.52mm^2 = 5.2e-7m^2
  // Maximum is large enough so that max resistance in a 9v battery slows to a good rate
  public static readonly WIRE_RESISTIVITY_RANGE = new Range( CCKCQueryParameters.wireResistivity, 0.0168 ); // Ohm * m

  public static readonly WIRE_CROSS_SECTIONAL_AREA = 5E-4; // meters squared

  // Lowest resistance a wire can have
  public static readonly MINIMUM_WIRE_RESISTANCE = 1E-14;

  // The lowest resistance other CircuitElements can have. This is the resistance of a wire the same length as a resistor
  public static readonly MINIMUM_RESISTANCE = 1.1E-10;

  // How far to erode the visible bounds for keeping the probes in bounds.
  public static readonly DRAG_BOUNDS_EROSION = 20;

  // Distance between adjacent charges within a circuit element
  public static readonly CHARGE_SEPARATION = 28;

  // Length of a battery
  public static readonly BATTERY_LENGTH = 102;

  // Length of the AC Voltage
  public static readonly AC_VOLTAGE_LENGTH = 68;

  // Length of a switch, not so wide that electrons appear in the notches
  public static readonly SWITCH_LENGTH = 112;

  public static readonly SWITCH_START = 1 / 3; // fraction along the switch to the pivot
  public static readonly SWITCH_END = 2 / 3; // fraction along the switch to the connection point

  // Length of a resistor
  public static readonly RESISTOR_LENGTH = 110;

  public static readonly FUSE_LENGTH = 110;
  public static readonly WIRE_LENGTH = 100;

  public static readonly CAPACITOR_LENGTH = 110;

  public static readonly INDUCTOR_LENGTH = 110;

  // Length of household items in view coordinates
  public static readonly COIN_LENGTH = 85;
  public static readonly ERASER_LENGTH = 90;
  public static readonly PENCIL_LENGTH = 130;
  public static readonly HAND_LENGTH = 140;
  public static readonly DOG_LENGTH = 170;
  public static readonly DOLLAR_BILL_LENGTH = 140;
  public static readonly PAPER_CLIP_LENGTH = 75;

  // Length
  public static readonly SERIES_AMMETER_LENGTH = 121;

  // radius for panels and radio buttons
  public static readonly CORNER_RADIUS = 6;

  // Line width for schematic view
  public static readonly SCHEMATIC_LINE_WIDTH = 4;

  // The maximum resistance any circuit element can have.  An open switch is modeled as a high-resistance resistor
  public static readonly MAX_RESISTANCE = 1000000000;

  // scale applied to the light bulb view
  public static readonly BULB_SCALE = 2.52;

  // tweaker amount for the high resistance or high voltage components
  public static readonly HIGH_EDITOR_DELTA = 100;

  // default resistance for the high resistance light bulb or high resistance resistor
  public static readonly HIGH_RESISTANCE = 1000;

  public static readonly HIGH_RESISTANCE_RANGE = new Range( 100, 10000 );

  public static readonly PANEL_LINE_WIDTH = 1.3;

  public static readonly THUMB_SIZE = new Dimension2( 13, 24 );

  public static readonly MAJOR_TICK_LENGTH = 18;
  public static readonly MINOR_TICK_LENGTH = 12;

  // The main font size to use for labels and controls
  public static readonly FONT_SIZE = FONT_SIZE;

  public static readonly DEFAULT_FONT = new PhetFont( FONT_SIZE );

  // Number of wires that can be dragged out of the toolbox
  public static readonly NUMBER_OF_WIRES = 50;

  // The number of gridlines in the charts that indicate the progression of time.
  public static readonly NUMBER_OF_TIME_DIVISIONS = 4;

  public static readonly CHART_SERIES_COLOR = '#404041';

  public static readonly DC_CAROUSEL_SCALE = 1.2;

  public static readonly AC_CAROUSEL_SCALE = 0.85;

  // Shared credits for all Circuit Construction Kit flavors (DC, DC-VL, AC, AC-VL)
  public static readonly CREDITS: CreditsData = {
    leadDesign: 'Amy Rouinfar',
    softwareDevelopment: 'Sam Reid, Denzell Barnett, Matthew Blackman',
    team: 'Wendy Adams, Matthew Blackman, Michael Dubson, Noah Finkelstein, Chris Keller, Ariel Paul, Kathy Perkins, Taliesin Smith, Carl Wieman',
    qualityAssurance: 'Jaspe Arias, Steele Dalton, Amanda Davis, Alex Dornan, Jaron Droder, Bryce Griebenow, Clifford Hardin, Ethan Johnson, Megan Lai, Brooklyn Lash, Emily Miller, Matthew Moore, Ashton Morris, Liam Mulhall, Devon Quispe, Ben Roberts, Jacob Romero, Nancy Salpepi, Marla Schulz, Ethan Ward, Kathryn Woessner',
    graphicArts: 'Bryce Gruneich, Mariah Hermsmeyer, Cheryl McCutchan'
  };

  public static readonly MAX_DT = 0.5; // see https://github.com/phetsims/circuit-construction-kit-common/issues/476 and https://github.com/phetsims/joist/issues/130

  public static readonly KEYBOARD_DRAG_SPEED = 400;
  public static readonly SHIFT_KEYBOARD_DRAG_SPEED = 50;

  // Slider step specifications for keyboard accessibility
  // Note that shiftKeyboardStep is provided to delta and to shiftKeyboardStep, see where NumberControl says:
  //
  // > pdom - by default, shiftKeyboardStep should most likely be the same as clicking the arrow buttons.
  // > shiftKeyboardStep: options.delta,
  public static readonly SLIDER_STEPS = {
    batteryVoltageNumberControl: {
      step: 10,
      pageKeyboardStep: 20,
      shiftKeyboardStep: 0.1,
      pointerRoundingInterval: 1
    },
    extremeBatteryVoltageNumberControl: {
      step: 5000,
      pageKeyboardStep: 10000,
      shiftKeyboardStep: 10,
      pointerRoundingInterval: 1000
    },
    resistorAndLightBulbResistanceNumberControl: {
      step: 10,
      pageKeyboardStep: 20,
      shiftKeyboardStep: 0.1,
      pointerRoundingInterval: 1
    },
    extremeResistorAndLightBulbResistanceNumberControl: {
      step: 500,
      pageKeyboardStep: 1000,
      shiftKeyboardStep: 10,
      pointerRoundingInterval: 100
    },
    fuseCurrentRatingControl: {
      step: 1,
      pageKeyboardStep: 2.5,
      shiftKeyboardStep: 0.1,
      pointerRoundingInterval: 0.1
    },
    sourceResistanceControl: {
      step: 1,
      pageKeyboardStep: 2
    },
    acVoltageControl: {
      step: 10,
      pageKeyboardStep: 20,
      shiftKeyboardStep: 0.01,
      pointerRoundingInterval: 1
    },
    frequencyControl: {
      step: 0.1,
      pageKeyboardStep: 0.2,
      shiftKeyboardStep: 0.01,
      pointerRoundingInterval: 0.01
    },
    capacitanceNumberControl: {
      step: 0.01,
      pageKeyboardStep: 0.02,
      shiftKeyboardStep: 0.01,

      pointerRoundingInterval: 0.01
    },
    inductanceNumberControl: {
      step: 0.5,
      pageKeyboardStep: 1,
      shiftKeyboardStep: 0.001,
      pointerRoundingInterval: 0.1
    }
  } as const;
}

circuitConstructionKitCommon.register( 'CCKCConstants', CCKCConstants );