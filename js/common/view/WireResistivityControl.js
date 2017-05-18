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
  var Text = require( 'SCENERY/nodes/Text' );
  var HSlider = require( 'SUN/HSlider' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CCKAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CCKAccordionBox' );

  //strings
  var tinyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tiny' );
  var lotsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lots' );
  var wireResistivityString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wireResistivity' );

  /**
   * @param {Property.<number>} wireResistivityProperty
   * @param {Tandem} tandem
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

    CCKAccordionBox.call( this, slider, wireResistivityString, tandem );
  }

  circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );

  return inherit( CCKAccordionBox, WireResistivityControl );
} );
