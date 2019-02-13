// Copyright 2016-2019, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Panel = require( 'SUN/Panel' );

  class CCKCPanel extends Panel {

    /**
     * @param {Node} content - what will appear in the panel
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( content, tandem, options ) {
      options = _.extend( {
        fill: CCKCConstants.PANEL_COLOR,
        lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
        xMargin: 15,
        yMargin: 15,
        tandem: tandem,
        cornerRadius: CCKCConstants.CORNER_RADIUS
      }, options );
      super( content, options );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCPanel', CCKCPanel );
} );