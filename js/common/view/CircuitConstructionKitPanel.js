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
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var Panel = require( 'SUN/Panel' );

  function CircuitConstructionKitPanel( content, options ) {
    options = _.extend( {
      fill: '#f1f1f2',
      stroke: 'black',
      lineWidth: 1.3,
      xMargin: 15,
      yMargin: 15
    }, options );
    Panel.call( this, content, options );
  }

  circuitConstructionKit.register( 'CircuitConstructionKitPanel', CircuitConstructionKitPanel );

  return inherit( Panel, CircuitConstructionKitPanel, {} );
} );