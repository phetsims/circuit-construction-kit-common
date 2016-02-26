// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Panel = require( 'SUN/Panel' );

  function CircuitConstructionKitBasicsPanel( content, options ) {
    options = _.extend( {
      fill: '#f1f1f2',
      stroke: 'black',
      lineWidth: 1.3,
      xMargin: 15,
      yMargin: 15
    }, options );
    Panel.call( this, content, options );
  }

  circuitConstructionKitBasics.register( 'CircuitConstructionKitBasicsPanel', CircuitConstructionKitBasicsPanel );

  return inherit( Panel, CircuitConstructionKitBasicsPanel, {} );
} );