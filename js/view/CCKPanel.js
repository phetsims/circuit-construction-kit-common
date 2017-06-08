// Copyright 2016-2017, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Panel = require( 'SUN/Panel' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  /**
   * @param {Node} content - what will appear in the panel
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CCKPanel( content, tandem, options ) {
    options = _.extend( {
      fill: CircuitConstructionKitConstants.PANEL_COLOR,
      stroke: 'black',
      lineWidth: CircuitConstructionKitConstants.PANEL_LINE_WIDTH,
      xMargin: 15,
      yMargin: 15,
      tandem: tandem,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS
    }, options );
    Panel.call( this, content, options );
  }

  circuitConstructionKitCommon.register( 'CCKPanel', CCKPanel );

  return inherit( Panel, CCKPanel, {} );
} );