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
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitAccordionBox' );
  var Range = require( 'DOT/Range' );
  var Util = require( 'DOT/Util' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Color = require( 'SCENERY/util/Color' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var HSlider = require( 'SUN/HSlider' );
  var Panel = require( 'SUN/Panel' );

  // strings
  var batteryResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance' );
  var resistanceOhmsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhms' );

  /**
   * @param {Property.<number>} batteryResistanceProperty - axon Property for the internal resistance of all Batteries
   * @param {AlignGroup} alignGroup
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

    var slider = new HSlider(
      batteryResistanceProperty,
      //REVIEW*: Extracting info about the 0-10 range may simplify a few things?
      new Range( CircuitConstructionKitCommonConstants.DEFAULT_BATTERY_RESISTANCE, 10 ), {
        trackSize: CircuitConstructionKitCommonConstants.SLIDER_TRACK_SIZE,
        thumbSize: CircuitConstructionKitCommonConstants.THUMB_SIZE,
        majorTickLength: CircuitConstructionKitCommonConstants.MAJOR_TICK_LENGTH,

        // Snap to the nearest whole number.
        constrainValue: function( value ) { return Util.roundSymmetric( value ); },
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
      font: new PhetFont( CircuitConstructionKitCommonConstants.FONT_SIZE ),
      fill: Color.BLACK,
      maxWidth: 100,
      tandem: readoutTextPanelTandem.createTandem( 'readoutTextNode' )
    } );

    // number to be displayed
    batteryResistanceProperty.link( function( value ) {
      readoutTextNode.setText( StringUtils.fillIn( resistanceOhmsString, { resistance: Util.toFixed( value, 1 ) } ) );
    } );

    var readoutTextPanel = new Panel( readoutTextNode, {
      fill: Color.WHITE,
      stroke: Color.GRAY,
      //REVIEW*: Don't lineWidth:1, it's the default (unless you're doing complicated overriding)
      lineWidth: 1, // width of the background border
      xMargin: 4,
      yMargin: 3,
      cornerRadius: 0, // radius of the rounded corners on the background
      //REVIEW*: resize:true is also the default, not needed
      resize: true, // dynamically resize when content bounds change
      backgroundPickable: false,
      tandem: readoutTextPanelTandem
    } );

    CircuitConstructionKitAccordionBox.call( this, alignGroup.createBox( new VBox( {
      spacing: -4,
      children: [ readoutTextPanel, slider ]
    } ) ), batteryResistanceString, tandem );
  }

  circuitConstructionKitCommon.register( 'BatteryResistanceControl', BatteryResistanceControl );

  return inherit( CircuitConstructionKitAccordionBox, BatteryResistanceControl );
} );
