// Copyright 2017, University of Colorado Boulder

/**
 * Button that reverses a battery
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );

  // images
  var batteryImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  /**
   * @param {Circuit} circuit - the circuit that contains the battery
   * @param {CircuitElement} battery - the Battery to rotate
   * @param {Tandem} tandem
   * @constructor
   */
  function RotateBatteryButton( circuit, battery, tandem ) {

    var icon = new Image( batteryImage, { maxHeight: 10 } );
    var ICON_SCALE = 0.014;
    RoundPushButton.call( this, {
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      content: new VBox( {
        spacing: 3,
        children: [

          // path split up from FontAwesomeNode
          new Path( 'M1511 480q0 -5 -1 -7q-64 -268 -268 -434.5t-478 -166.5q-146 0 -282.5 55t-243.5 157l-129 -129q-19 -19 -45 -19t-45 19t-19 45v448q0 26 19 45t45 19h448q26 0 45 -19t19 -45t-19 -45l-137 -137q71 -66 161 -102t187 -36q134 0 250 65t186 179q11 17 53 117 q8 23 30 23h192q13 0 22.5 -9.5t9.5 -22.5z', {
            fill: 'black',
            scale: ICON_SCALE
          } ),
          icon,
          new Path( 'M1536 1280v-448q0 -26 -19 -45t-45 -19h-448q-26 0 -45 19t-19 45t19 45l138 138q-148 137 -349 137q-134 0 -250 -65t-186 -179q-11 -17 -53 -117q-8 -23 -30 -23h-199q-13 0 -22.5 9.5t-9.5 22.5v7q65 268 270 434.5t480 166.5 q146 0 284 -55.5t245 -156.5l130 129q19 19 45 19t45 -19t19 -45z', {
            fill: 'black',
            scale: ICON_SCALE
          } )
        ]
      } ),

      listener: function() {
        circuit.flip( battery );
      },
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'RotateBatteryButton' )
    } );
  }

  circuitConstructionKitCommon.register( 'RotateBatteryButton', RotateBatteryButton );

  return inherit( RoundPushButton, RotateBatteryButton );
} );