// Copyright 2016-2017, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Panel = require( 'SUN/Panel' );

  /**
   * @param {Node} content - what will appear in the panel
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitPanel( content, tandem, options ) {
    options = _.extend( {
      fill: CircuitConstructionKitCommonConstants.PANEL_COLOR,
      stroke: Color.BLACK, //REVIEW*: That's the default, can be omitted?
      lineWidth: CircuitConstructionKitCommonConstants.PANEL_LINE_WIDTH,
      xMargin: 15,
      yMargin: 15,
      tandem: tandem,
      cornerRadius: CircuitConstructionKitCommonConstants.CORNER_RADIUS
    }, options );
    Panel.call( this, content, options );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitPanel', CircuitConstructionKitPanel );

  return inherit( Panel, CircuitConstructionKitPanel, {} );
} );