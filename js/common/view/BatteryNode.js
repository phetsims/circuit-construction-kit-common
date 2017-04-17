// Copyright 2015-2017, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Renders the lifelike/schematic view for a Battery.
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

  // constants

  // Offset at left vertex
  var LEFT_OFFSET = -47;

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} circuitNode
   * @param {Battery} battery
   * @param {Property.<boolean>} runningProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function BatteryNode( circuitConstructionKitScreenView, circuitNode, battery, runningProperty, viewProperty, tandem ) {
    this.battery = battery;

    // Points sampled using Photoshop from a raster of the IEEE icon seen at https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
    var batteryImageNode = new Image( batteryImage );

    // Align vertically
    var y = batteryImageNode.height / 2 + 7;

    var schematicShape = new Shape()
      .moveTo( 47 + LEFT_OFFSET, y )
      .lineTo( 123 + LEFT_OFFSET, y )
      .moveTo( 123 + LEFT_OFFSET, 122 - 99 + y )
      .lineTo( 123 + LEFT_OFFSET, 74 - 99 + y )
      .moveTo( 156 + LEFT_OFFSET, y )
      .lineTo( 235 + LEFT_OFFSET, y )
      .moveTo( 156 + LEFT_OFFSET, 151 - 99 + y )
      .lineTo( 156 + LEFT_OFFSET, 46 - 99 + y );
    var width = schematicShape.bounds.width;
    var desiredWidth = batteryImageNode.width;
    var scale = desiredWidth / width;

    // Scale to fit the correct width
    var scaleMatrix = Matrix3.scale( scale, scale );
    schematicShape = schematicShape.transformed( scaleMatrix );
    var schematicNode = new Path( schematicShape, {
      stroke: 'black', lineWidth: 6
    } );

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitNode,
      battery,
      viewProperty,
      batteryImageNode,
      schematicNode,
      0.7,
      tandem, {
        verticalOffset: 15
      }
    );
  }

  circuitConstructionKitCommon.register( 'BatteryNode', BatteryNode );

  return inherit( FixedLengthCircuitElementNode, BatteryNode );
} );