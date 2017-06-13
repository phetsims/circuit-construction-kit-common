// Copyright 2017, University of Colorado Boulder

/**
 * Controls for showing and changing the battery internal resistance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var CCKAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKAccordionBox' );
  var Util = require( 'DOT/Util' );
  var Range = require( 'DOT/Range' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  //strings
  var batteryResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance' );
  var resistanceOhmsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhms' );
  var resistanceOhmString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhm' );

  /**
   * @param {Property.<number>} batteryResistanceProperty - the axon Property for the internal resistance of all Batteries
   * @param {Tandem} tandem
   * @constructor
   */
  function BatteryResistanceControl( batteryResistanceProperty, alignGroup, tandem ) {

    /**
     * Creates label to be used for slider
     * @param {string} string
     * @param {Tandem} tandem
     * @returns {Text}
     */
    var createLabel = function( string, tandem ) {
      return new Text( string, { fontSize: 12, tandem: tandem } );
    };

    var slider = new HSlider( batteryResistanceProperty, new Range( CircuitConstructionKitConstants.DEFAULT_BATTERY_RESISTANCE, 10 ), {
      trackSize: CircuitConstructionKitConstants.SLIDER_TRACK_SIZE,
      thumbSize: CircuitConstructionKitConstants.THUMB_SIZE,
      majorTickLength: CircuitConstructionKitConstants.MAJOR_TICK_LENGTH,

      // Snap to the nearest whole number.
      constrainValue: function( value ) {return Util.roundSymmetric( value );},
      tandem: tandem.createTandem( 'slider' )
    } );
    slider.addMajorTick( 0, createLabel( '0', tandem.createTandem( 'minLabel' ) ) );
    slider.addMajorTick( 5 );
    slider.addMajorTick( 10, createLabel( '10', tandem.createTandem( 'maxLabel' ) ) );

    for ( var i = 1; i < 10; i++ ) {
      if ( i !== 5 ) {
        slider.addMinorTick( i );
      }
    }

    var readoutTextPanelTandem = tandem.createTandem( 'readoutTextPanel' );

    var readoutTextNode = new Text( batteryResistanceProperty.get(), {
      font: new PhetFont( 14 ),
      fill: 'black',
      tandem: readoutTextPanelTandem.createTandem( 'readoutTextNode' )
    } );

    // number to be displayed
    batteryResistanceProperty.link( function( value ) {
      if ( value === 1 ) {
        readoutTextNode.setText( StringUtils.fillIn( resistanceOhmString, { resistance: Util.toFixed( value, 0 ) } ) );
      }
      else {
        readoutTextNode.setText( StringUtils.fillIn( resistanceOhmsString, { resistance: Util.toFixed( value, 0 ) } ) );
      }
    } );

    var readoutTextPanel = new Panel( readoutTextNode, {
      fill: 'white',
      stroke: 'gray',
      lineWidth: 1, // width of the background border
      xMargin: 4,
      yMargin: 3,
      cornerRadius: 0, // radius of the rounded corners on the background
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: false,
      tandem: readoutTextPanelTandem
    } );

    CCKAccordionBox.call( this, alignGroup.createBox( new VBox( {
      spacing: -4,
      children: [ readoutTextPanel, slider ]
    } ) ), batteryResistanceString, tandem );
  }

  circuitConstructionKitCommon.register( 'BatteryResistanceControl', BatteryResistanceControl );

  return inherit( CCKAccordionBox, BatteryResistanceControl );
} );
