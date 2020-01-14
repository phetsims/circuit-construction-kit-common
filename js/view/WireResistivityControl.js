// Copyright 2017-2019, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.  Exists for the life of the sim and hence does not require a
 * dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const HSlider = require( 'SUN/HSlider' );
  const Range = require( 'DOT/Range' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const lotsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lots' );
  const tinyString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/tiny' );
  const wireResistivityString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wireResistivity' );

  // constants
  const TICK_LABEL_TEXT_OPTIONS = { fontSize: 12, maxWidth: 45 };

  // Chosen so that current through battery+long wire+long wire+resistor would match prior verison, see https://github.com/phetsims/circuit-construction-kit-common/issues/553
  const MAX_RESISTIVITY = CCKCConstants.DEFAULT_RESISTIVITY * 1000;

  class WireResistivityControl extends VBox {

    /**
     * @param {Property.<number>} wireResistivityProperty
     * @param {AlignGroup} alignGroup - for alignment with other controls
     * @param {Tandem} tandem
     */
    constructor( wireResistivityProperty, alignGroup, tandem ) {

      const titleNode = new Text( wireResistivityString, { fontSize: 12, maxWidth: 200 } );

      const slider = new HSlider( wireResistivityProperty, new Range(
        CCKCConstants.DEFAULT_RESISTIVITY,
        MAX_RESISTIVITY // large enough so that max resistance in a 9v battery slows to a good rate
      ), {
        trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
        thumbSize: CCKCConstants.THUMB_SIZE,
        majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
        tandem: tandem.createTandem( 'slider' )
      } );

      slider.addMajorTick( 0, new Text( tinyString, TICK_LABEL_TEXT_OPTIONS ) );
      slider.addMajorTick( MAX_RESISTIVITY, new Text( lotsString, TICK_LABEL_TEXT_OPTIONS ) );

      super( {
        children: [ titleNode, slider ]
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );
} );