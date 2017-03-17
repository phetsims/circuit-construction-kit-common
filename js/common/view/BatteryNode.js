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
  var Matrix3 = require( 'DOT/Matrix3' );

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
    var y = batteryImageNode.height + 6;
    var x = -47;
    var schematicShape = new Shape()
      .moveTo( 47 + x, y )
      .lineTo( 123 + x, y )
      .moveTo( 123 + x, 122 - 99 + y )
      .lineTo( 123 + x, 74 - 99 + y )
      .moveTo( 156 + x, y )
      .lineTo( 235 + x, y )
      .moveTo( 156 + x, 151 - 99 + y )
      .lineTo( 156 + x, 46 - 99 + y );
    var width = schematicShape.bounds.width;
    var desiredWidth = batteryImageNode.width;
    var scale = desiredWidth / width;
    var scaleMatrix = Matrix3.scale( scale, scale );
    schematicShape = schematicShape.transformed( scaleMatrix );
    var plusShape = new Shape().moveTo( 191 + x, 64 - 99 + y ).lineTo( 191 + x, 81 - 99 + y ).moveTo( 178 + x, 73 - 99 + y ).lineTo( 203 + x, 73 - 99 + y );
    plusShape = plusShape.transformed( scaleMatrix );
    var path2 = new Path( plusShape, {
      stroke: 'black', lineWidth: 4
    } );
    var schematicNode = new Path( schematicShape, {
      stroke: 'black', lineWidth: 6,
      children: [
        path2
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