// Copyright 2017, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Dimension2 = require( 'DOT/Dimension2' );
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

  /**
   * @constructor
   */
  function BatteryResistanceControl( batteryResistanceProperty, tandem ) {
    //var max = CircuitConstructionKitConstants.DEFAULT_BATTERY_RESISTANCE;
    var slider = new HSlider( batteryResistanceProperty, {
      trackSize: new Dimension2( 150, 5 ),
      majorTickLength: 2,
      minorTickLength: 5,
      min: CircuitConstructionKitConstants.DEFAULT_BATTERY_RESISTANCE,
      max: 10
    } );
    var createText = function( string, visible ) {
      return new Text( string, {
        fontSize: 12,
        visible: visible
      } );
    };

    var createLabel = function( min ) {
      return new Node( {
        children: min ? [ createText( '0', true ) ] : [ createText( '10', true ) ]
      } );
    };

    var numberNode = new Text( batteryResistanceProperty.get(), { font: new PhetFont( 14 ), fill: 'black' } );

    // number to be displayed
    batteryResistanceProperty.link( function( value ) {
      numberNode = new Text( value + ' ohms', { font: new PhetFont( 14 ), fill: 'black' } );
    } );

    // background for displaying the value
    var backgroundNode = new Rectangle( 0, 0, 60, 20,
      2, 2, {
        fill: 'white',
        stroke: 'black',
        lineWidth: 2
      } );
    numberNode.center = backgroundNode.center;
    var valueParent = new Node( { children: [ backgroundNode, numberNode ] } );

    slider.addMajorTick( 0, createLabel( true ) );
    slider.addMajorTick( 5 );
    slider.addMajorTick( 10, createLabel( false ) );
    for ( var i = 1; i < 10; i++ ) {
      if ( i !== 5 ) {
        slider.addMinorTick( i );
      }
    }
    AccordionBox.call( this, new VBox( { children: [ valueParent, slider ] } ), {
      fill: '#f1f1f2',
      cornerRadius: 10,
      titleXMargin: 10,
      buttonXMargin: 10,
      titleYMargin: 4,
      titleXSpacing: 14,
      minWidth: CircuitConstructionKitConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      titleNode: new HBox( {
        children: [
          new HStrut( 10 ),
          new Text( 'Battery Resistance', {
            fontSize: 16
          } )
        ]
      } )
    } );
  }

  circuitConstructionKitCommon.register( 'BatteryResistanceControl', BatteryResistanceControl );

  return inherit( AccordionBox, BatteryResistanceControl );
} );