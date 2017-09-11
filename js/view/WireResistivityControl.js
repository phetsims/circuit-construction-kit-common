// Copyright 2017, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.  Exists for the life of the sim and hence does not require a
 * dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CircuitConstructionKitAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitAccordionBox' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var lotsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lots' );
  var tinyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tiny' );
  var wireResistivityString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wireResistivity' );

  // constants
  var TICK_LABEL_TEXT_OPTIONS = { fontSize: 12, maxWidth: 45 };
  var MAX_RESISTIVITY = 1;

  /**
   * @param {Property.<number>} wireResistivityProperty
   * @param {AlignGroup} alignGroup - for alignment with other controls
   * @param {Tandem} tandem
   * @constructor
   */
  function WireResistivityControl( wireResistivityProperty, alignGroup, tandem ) {
    var slider = new HSlider( wireResistivityProperty, {
      min: CircuitConstructionKitCommonConstants.DEFAULT_RESISTIVITY,
      max: MAX_RESISTIVITY // large enough so that max resistance in a 9v battery slows to a good rate
    }, {
      trackSize: CircuitConstructionKitCommonConstants.SLIDER_TRACK_SIZE,
      thumbSize: CircuitConstructionKitCommonConstants.THUMB_SIZE,
      majorTickLength: CircuitConstructionKitCommonConstants.MAJOR_TICK_LENGTH,
      tandem: tandem.createTandem( 'slider' )
    } );

    slider.addMajorTick( 0, new Text( tinyString, TICK_LABEL_TEXT_OPTIONS ) );
    slider.addMajorTick( MAX_RESISTIVITY, new Text( lotsString, TICK_LABEL_TEXT_OPTIONS ) );

    CircuitConstructionKitAccordionBox.call( this, alignGroup.createBox( slider ), wireResistivityString, tandem );
  }

  circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );

  return inherit( CircuitConstructionKitAccordionBox, WireResistivityControl );
} );
