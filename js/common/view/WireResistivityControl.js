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
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Dimension2 = require( 'DOT/Dimension2' );

  /**
   * @constructor
   */
  function WireResistivityControl( wireResistivityProperty, tandem ) {
    var max = CircuitConstructionKitConstants.DEFAULT_RESISTIVITY * 10000;
    var slider = new HSlider( wireResistivityProperty, {
      min: CircuitConstructionKitConstants.DEFAULT_RESISTIVITY,
      max: max // large enough so that max resistance in a 9v battery slows to a good rate
    }, {
      trackSize: CircuitConstructionKitConstants.SLIDER_TRACK_SIZE,
      tandem: tandem.createTandem( 'slider' )
    } );
    var createText = function( string, visible ) {
      return new Text( string, {
        fontSize: 12,
        visible: visible
      } );
    };

    var createLabel = function( min ) {
      return new Node( {
        children: min ? [ createText( 'tiny', true ) ] : [ createText( 'lots', true ) ]
      } );
    };
    slider.addMajorTick( 0, createLabel( true ) );
    slider.addMajorTick( max, createLabel( false ) );
    AccordionBox.call( this, slider, {
      fill: CircuitConstructionKitConstants.PANEL_COLOR,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: 10,
      titleYMargin: 4,
      titleXSpacing: 14,
      titleNode: new HBox( {
        children: [
          new HStrut( 10 ),
          new Text( 'Wire Resistivity', {
            fontSize: 16
          } )
        ]
      } )
    } );
  }

  circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );

  return inherit( AccordionBox, WireResistivityControl );
} );