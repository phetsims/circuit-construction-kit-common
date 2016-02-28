// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var FixedLengthComponentNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthComponentNode' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/battery.png' );

  /**
   *
   * @constructor
   */
  function BatteryNode( circuit, battery ) {
    this.battery = battery;
    FixedLengthComponentNode.call( this, circuit, battery, batteryImage );
  }

  circuitConstructionKitBasics.register( 'BatteryNode', BatteryNode );

  return inherit( FixedLengthComponentNode, BatteryNode );
} );