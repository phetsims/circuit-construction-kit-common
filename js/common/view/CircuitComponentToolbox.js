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
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );

  function CircuitComponentToolbox() {
    CircuitConstructionKitBasicsPanel.call( this, new VBox( {
      children: [
        new Text( 'wire' ),
        new Text( 'battery' ),
        new Text( 'lightbulb' ),
        new Text( 'resistor' )
      ]
    } ) );
  }

  circuitConstructionKitBasics.register( 'CircuitComponentToolbox', CircuitComponentToolbox );
  return inherit( CircuitConstructionKitBasicsPanel, CircuitComponentToolbox, {} );
} );