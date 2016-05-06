// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/FixedLengthCircuitElementNode' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT/battery.png' );

  /**
   *
   * @constructor
   */
  function BatteryNode( circuitConstructionKitScreenView, circuitNode, battery ) {
    this.battery = battery;
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, battery, new Image( batteryImage ), 0.7 );
  }

  circuitConstructionKit.register( 'BatteryNode', BatteryNode );

  return inherit( FixedLengthCircuitElementNode, BatteryNode );
} );