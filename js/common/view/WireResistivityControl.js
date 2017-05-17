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
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );

  //strings
  var tinyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tiny' );
  var lotsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lots' );
  var wireResistivityString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wireResistivity' );

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

    /**
     * Creates label for the slider within the control accordionBox
     * @param {boolean} min - determines whether the label is the minimum or not
     *
     * @returns {Text} Text with the value of 'tiny' or 'lots'
     */
    var createLabel = function( min ) {
      return new Text( min ? tinyString : lotsString, { fontSize: 12 } );
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
          new Text( wireResistivityString, { fontSize: 16, tandem: tandem.createTandem( 'wireResistanceText' ) } )
        ]
      } ),
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );

  return inherit( AccordionBox, WireResistivityControl );
} );
