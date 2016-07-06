// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementNode' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  /**
   *
   * @constructor
   */
  function BatteryNode( circuitConstructionKitScreenView, circuitNode, battery ) {
    this.battery = battery;
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, battery, new Image( batteryImage ), 0.7 );
  }

  circuitConstructionKitCommon.register( 'BatteryNode', BatteryNode );

  return inherit( FixedLengthCircuitElementNode, BatteryNode );
} );