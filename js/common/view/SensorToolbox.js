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
  var CircuitConstructionKitBasicsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsPanel' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );

  function SensorToolbox() {
    CircuitConstructionKitBasicsPanel.call( this, new HBox( {
      children: [
        new Text( 'voltmeter' ),
        new Text( 'ammeter' )
      ]
    } ) );
  }

  circuitConstructionKitBasics.register( 'SensorToolbox', SensorToolbox );
  return inherit( CircuitConstructionKitBasicsPanel, SensorToolbox, {} );
} );