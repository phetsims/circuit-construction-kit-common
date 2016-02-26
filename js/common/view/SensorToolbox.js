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
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/AmmeterNode' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  function SensorToolbox() {

    var toolIconLength = CircuitConstructionKitBasicsConstants.toolboxIconLength;

    var voltmeterNodeIcon = new VoltmeterNode();
    voltmeterNodeIcon.mutate( { scale: toolIconLength / Math.max( voltmeterNodeIcon.width, voltmeterNodeIcon.height ) } );

    var ammeterNodeIcon = new AmmeterNode();
    ammeterNodeIcon.mutate( { scale: toolIconLength / Math.max( ammeterNodeIcon.width, ammeterNodeIcon.height ) } );

    CircuitConstructionKitBasicsPanel.call( this, new HBox( {
      spacing: CircuitConstructionKitBasicsConstants.toolboxItemSpacing,
      children: [
        voltmeterNodeIcon,
        ammeterNodeIcon
      ]
    } ) );
  }

  circuitConstructionKitBasics.register( 'SensorToolbox', SensorToolbox );
  return inherit( CircuitConstructionKitBasicsPanel, SensorToolbox, {} );
} );