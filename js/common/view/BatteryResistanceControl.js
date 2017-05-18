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
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Util = require( 'DOT/Util' );
  var Range = require( 'DOT/Range' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  //strings
  var batteryResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance' );
  var resistanceOhmsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhms' );

  /**
   * @param {Property.<number>} batteryResistanceProperty - the axon Property for the internal resistance of all Batteries
   * @param {Tandem} tandem
   * @constructor
   */
  function BatteryResistanceControl( batteryResistanceProperty, tandem ) {

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
      majorTickLength: 2,
      minorTickLength: 5,
      // Snap to the nearest whole number.
      constrainValue: function( value ) {return Util.roundSymmetric( value );},
      tandem: tandem.createTandem( 'slider' )
    } );
    slider.addMajorTick( 0, createLabel( '0', tandem.createTandem( 'minLabel' ) ) );
    slider.addMajorTick( 5 );
    slider.addMajorTick( 10, createLabel( '10', tandem.createTandem( 'maxLabel' ) ) );

    var numberNodesGroupTandem = tandem.createGroupTandem( 'numberNodes' );
    var valueParentsGroupTandem = tandem.createGroupTandem( 'valueParents' );
    for ( var i = 1; i < 10; i++ ) {
      if ( i !== 5 ) {
        slider.addMinorTick( i );
      }

      var numberNode = new Text( batteryResistanceProperty.get(), {
        font: new PhetFont( 14 ),
        fill: 'black',
        tandem: numberNodesGroupTandem.createNextTandem()
      } );

      // number to be displayed
      batteryResistanceProperty.link( function( value ) {
        numberNode.setText( StringUtils.fillIn( resistanceOhmsString, { resistance: Util.toFixed( value, 0 ) } ) );
      } );

      var valueParent = new Panel( numberNode, {
        fill: 'white',
        stroke: 'gray',
        lineWidth: 1, // width of the background border
        xMargin: 4,
        yMargin: 3,
        cornerRadius: 0, // radius of the rounded corners on the background
        resize: true, // dynamically resize when content bounds change
        backgroundPickable: false,
        tandem: valueParentsGroupTandem.createNextTandem()
      } );

    }
    AccordionBox.call( this, new VBox( {
      children: [ valueParent, slider ]
    } ), {
      fill: CircuitConstructionKitConstants.PANEL_COLOR,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: 10,
      titleYMargin: 4,
      titleXSpacing: 14,
      contentYSpacing: 4,
      tandem: tandem.createTandem( 'accordionBox' ),
      minWidth: CircuitConstructionKitConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      titleNode: new HBox( {
        children: [
          new HStrut( 10 ),
          new Text( batteryResistanceString, { fontSize: 16, tandem: tandem.createTandem( 'batteryResistanceText' ) } )
        ],
        tandem: tandem.createTandem( 'titleNode' )
      } )
    } );
  }

  circuitConstructionKitCommon.register( 'BatteryResistanceControl', BatteryResistanceControl );

  return inherit( AccordionBox, BatteryResistanceControl );
} );
