// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
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
   * @param content
   * @param {Tandem} tandem
   * @param options
   * @constructor
   */
  function CircuitConstructionKitPanel( content, tandem, options ) {
    options = _.extend( {
      fill: CircuitConstructionKitConstants.PANEL_COLOR,
      stroke: 'black',
      lineWidth: 1.3,
      xMargin: 15,
      yMargin: 15,
      tandem: tandem,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS
    }, options );
    Panel.call( this, content, options );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitPanel', CircuitConstructionKitPanel );

  return inherit( Panel, CircuitConstructionKitPanel, {} );
} );