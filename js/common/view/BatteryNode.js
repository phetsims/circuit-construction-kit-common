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
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  /**
   *
   * @constructor
   */
  function BatteryNode( circuitConstructionKitScreenView, circuitNode, battery, runningProperty, viewProperty, tandem ) {
    this.battery = battery;

    // Points sampled using Photoshop from a raster of the IEEE icon seen at https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
    var batteryImageNode = new Image( batteryImage );
    var y = 99;
    var schematicShape = new Shape()
      .moveTo( 47, y )
      .lineTo( 123, y )
      .moveTo( 123, 122 )
      .lineTo( 123, 74 )
      .moveTo( 156, y )
      .lineTo( 235, y )
      .moveTo( 156, 151 )
      .lineTo( 156, 46 );
    var schematicNode = new Path( schematicShape, {
      stroke: 'black', lineWidth: 6,
      children: [
        new Path( new Shape().moveTo( 191, 64 ).lineTo( 191, 81 ).moveTo( 178, 73 ).lineTo( 203, 73 ), {
          stroke: 'black', lineWidth: 4
        } )
      ]
    } );

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitNode,
      battery,
      viewProperty,
      batteryImageNode,
      schematicNode,
      0.7,
      tandem
    );
  }

  circuitConstructionKitCommon.register( 'BatteryNode', BatteryNode );

  return inherit( FixedLengthCircuitElementNode, BatteryNode );
} );