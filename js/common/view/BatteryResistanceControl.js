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
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Util = require( 'DOT/Util' );
  var Range = require( 'DOT/Range' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  //strings
  var batteryResistanceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/batteryResistance' );
  var resistanceUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceUnits' );

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
      tandem: tandem.createTandem( 'slider' )
    } );
    slider.addMajorTick( 0, createLabel( '0', tandem.createTandem( 'minLabel' ) ) );
    slider.addMajorTick( 5 );
    slider.addMajorTick( 10, createLabel( '10', tandem.createTandem( 'maxLabel' ) ) );

    var numberNodesGroupTandem = tandem.createGroupTandem( 'numberNodes' );
    var backgroundNodesGroupTandem = tandem.createGroupTandem( 'backgroundNodes' );
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
        numberNode.setText( StringUtils.fillIn( resistanceUnitsString, { resistance: Util.toFixed( value, 1 ) } ) );
      } );

      // background for displaying the value
      // TODO: This will become a panel, see https://github.com/phetsims/circuit-construction-kit-common/issues/305
      var backgroundNode = new Rectangle( 0, 0, 60, 20, 2, 2, {
        fill: 'white',
        stroke: 'black',
        lineWidth: 1,
        tandem: backgroundNodesGroupTandem.createNextTandem()
      } );
      numberNode.center = backgroundNode.center;
      var valueParent = new Node( {
        children: [ backgroundNode, numberNode ],
        tandem: valueParentsGroupTandem.createNextTandem()
      } );

    }
    AccordionBox.call( this, new VBox( {
      children: [ valueParent, slider ]
    } ), {
      fill: '#f1f1f2',
      cornerRadius: 10,
      titleXMargin: 10,
      buttonXMargin: 10,
      titleYMargin: 4,
      titleXSpacing: 14,
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
