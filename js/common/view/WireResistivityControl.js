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

  /**
   * @constructor
   */
  function WireResistivityControl( wireResistivityProperty, tandem ) {
    var slider = new HSlider( wireResistivityProperty, {
      min: 0,
      max: 100
    } );
    slider.addMajorTick( 0, new Text( 'very little', {
      fontSize: 12
    } ) );
    slider.addMajorTick( 100, new Text( 'lots', {
      fontSize: 12
    } ) );
    AccordionBox.call( this, slider, {
      titleNode: new Text( 'Wire Resistivity', {
        fontSize: 16,
        titleXSpacing: 14
      } )
    } );
  }

  circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );

  return inherit( AccordionBox, WireResistivityControl );
} );