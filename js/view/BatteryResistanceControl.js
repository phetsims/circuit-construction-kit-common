// Copyright 2017-2019, University of Colorado Boulder

/**
 * Controls for showing and changing the battery internal resistance.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCAccordionBox' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const HSlider = require( 'SUN/HSlider' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const batteryResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance' );
  const resistanceOhmsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhms' );

  class BatteryResistanceControl extends CCKCAccordionBox {
    /**
     * @param {Property.<number>} batteryResistanceProperty - axon Property for the internal resistance of all Batteries
     * @param {AlignGroup} alignGroup
     * @param {Tandem} tandem
     */
    constructor( batteryResistanceProperty, alignGroup, tandem ) {

      /**
       * Creates label to be used for slider
       * @param {string} string
       * @param {Tandem} tandem
       * @returns {Text}
       */
      const createLabel = ( string, tandem ) => new Text( string, { fontSize: 12, tandem: tandem } );

      const range = CCKCConstants.BATTERY_RESISTANCE_RANGE;
      const midpoint = ( range.max + range.min ) / 2;
      const slider = new HSlider( batteryResistanceProperty, range, {
        trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
        thumbSize: CCKCConstants.THUMB_SIZE,
        majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,

        // Snap to the nearest whole number.
        constrainValue: value => Util.roundSymmetric( value ),
        tandem: tandem.createTandem( 'slider' )
      } );
      slider.addMajorTick( range.min, createLabel( Util.toFixed( range.min, 0 ), tandem.createTandem( 'minLabel' ) ) );
      slider.addMajorTick( midpoint );
      slider.addMajorTick( range.max, createLabel( Util.toFixed( range.max, 0 ), tandem.createTandem( 'maxLabel' ) ) );

      for ( let i = range.min + 1; i < range.max; i++ ) {
        if ( i !== midpoint ) {
          slider.addMinorTick( i );
        }
      }

      const readoutTextPanelTandem = tandem.createTandem( 'readoutTextPanel' );

      const readoutText = new Text( batteryResistanceProperty.get(), {
        font: new PhetFont( CCKCConstants.FONT_SIZE ),
        fill: Color.BLACK,
        maxWidth: 100,
        tandem: readoutTextPanelTandem.createTandem( 'readoutTextNode' ),
        pickable: false
      } );

      const xMargin = 4;

      let textRectangle = null;

      // number to be displayed
      const updateText = value => {
        readoutText.setText( StringUtils.fillIn( resistanceOhmsString, { resistance: Util.toFixed( value, 1 ) } ) );

        // Once there is a textRectangle, stay right-justified
        if ( textRectangle ) {
          readoutText.right = textRectangle.right - xMargin;
        }
      };

      // Use the max to get the right size of the panel
      updateText( CCKCConstants.BATTERY_RESISTANCE_RANGE.max );

      textRectangle = Rectangle.bounds( readoutText.bounds.dilatedXY( xMargin, 3 ), {
        fill: Color.WHITE,
        stroke: Color.GRAY,
        cornerRadius: 0, // radius of the rounded corners on the background
        pickable: false,
        tandem: readoutTextPanelTandem
      } );

      const textContainerNode = new Node( {
        children: [ textRectangle, readoutText ],
        pickable: false
      } );

      batteryResistanceProperty.link( updateText );

      super( alignGroup.createBox( new VBox( {
        spacing: -4,
        children: [ textContainerNode, slider ]
      } ) ), batteryResistanceString, tandem );
    }
  }

  return circuitConstructionKitCommon.register( 'BatteryResistanceControl', BatteryResistanceControl );
} );
