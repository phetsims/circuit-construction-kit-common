// Copyright 2017-2019, University of Colorado Boulder

/**
 * Button that reverses a battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const ARROW_ICON_SCALE = 0.012;

  class RotateBatteryButton extends RoundPushButton {
    /**
     * @param {Circuit} circuit - the circuit that contains the battery
     * @param {CircuitElement} battery - the Battery to rotate
     * @param {Tandem} tandem
     */
    constructor( circuit, battery, tandem ) {

      // This SVG data was exported from assets/flip_battery_icon.ai, which was created by @arouinfar.  Using illustrator,
      // save the AI file as SVG, then inspect the file to get the path declaration.
      const batteryIcon = new Path( 'M59.42,9.597v7.807c0,0.719-0.32,1.331-0.957,1.84c-0.641,0.508-1.411,0.762-2.312,0.762v3.254 ' +
                                    'c0,0.894-0.398,1.659-1.199,2.296s-1.762,0.956-2.887,0.956H4.666c-1.125,0-2.086-0.319-2.887-0.956S0.58,24.152,0.58,23.259V3.741 ' +
                                    'c0-0.894,0.398-1.659,1.199-2.297C2.58,0.809,3.541,0.489,4.666,0.489h47.398c1.125,0,2.086,0.319,2.887,0.955 ' +
                                    'c0.801,0.638,1.199,1.403,1.199,2.297v3.253c0.901,0,1.672,0.255,2.312,0.764C59.1,8.265,59.42,8.878,59.42,9.597z M52.88,17.403 ' +
                                    'h3.271V9.597H52.88V3.741c0-0.189-0.074-0.345-0.227-0.467c-0.153-0.122-0.351-0.184-0.589-0.184H4.666 ' +
                                    'c-0.238,0-0.433,0.062-0.589,0.184C3.925,3.396,3.85,3.552,3.85,3.741v19.518c0,0.189,0.075,0.345,0.228,0.467 ' +
                                    'c0.156,0.121,0.351,0.184,0.589,0.184h47.398c0.238,0,0.436-0.062,0.589-0.184c0.152-0.122,0.227-0.277,0.227-0.467V17.403z ' +
                                    'M43.614,2.819v21.486H3.866V2.819H43.614z', { scale: 0.45, fill: Color.BLACK } );
      super( {
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        content: new VBox( {
          spacing: 3,
          children: [

            // taken from FontAwesomeNode's refresh arrow
            new Path( 'M1511 480q0 -5 -1 -7q-64 -268 -268 -434.5t-478 -166.5q-146 0 -282.5 55t-243.5 157l-129 -129q-19 -19 -45 -19t-45 19t-19 45v448q0 26 19 45t45 19h448q26 0 45 -19t19 -45t-19 -45l-137 -137q71 -66 161 -102t187 -36q134 0 250 65t186 179q11 17 53 117 q8 23 30 23h192q13 0 22.5 -9.5t9.5 -22.5z', {
              fill: Color.BLACK,
              scale: ARROW_ICON_SCALE
            } ),
            batteryIcon,

            // taken from FontAwesomeNode's refresh arrow
            new Path( 'M1536 1280v-448q0 -26 -19 -45t-45 -19h-448q-26 0 -45 19t-19 45t19 45l138 138q-148 137 -349 137q-134 0 -250 -65t-186 -179q-11 -17 -53 -117q-8 -23 -30 -23h-199q-13 0 -22.5 9.5t-9.5 22.5v7q65 268 270 434.5t480 166.5 q146 0 284 -55.5t245 -156.5l130 129q19 19 45 19t45 -19t19 -45z', {
              fill: Color.BLACK,
              scale: ARROW_ICON_SCALE
            } )
          ]
        } ),

        listener: () => circuit.flip( battery ),
        minXMargin: 10,
        minYMargin: 10,
        tandem: tandem.createTandem( 'RotateBatteryButton' )
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'RotateBatteryButton', RotateBatteryButton );
} );