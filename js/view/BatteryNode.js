// Copyright 2015-2017, University of Colorado Boulder

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
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );
  var batteryHighImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery_high.png' );

  // constants
  // dimensions for schematic battery
  var SMALL_TERMINAL_WIDTH = 50;
  var LARGE_TERMINAL_WIDTH = 104;
  var WIDTH = 188;
  var GAP = 33;
  var LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
  var RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Battery} battery
   * @param {Property.<boolean>} showResultsProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function BatteryNode( circuitConstructionKitScreenView, circuitLayerNode, battery, showResultsProperty, viewProperty, tandem, options ) {

    // @public (read-only) {Battery} - the Battery rendered by this Node
    this.battery = battery;

    var lifelikeNode = new Image( battery.batteryType === 'normal' ? batteryImage : batteryHighImage );

    lifelikeNode.mutate( {
      scale: battery.distanceBetweenVertices / lifelikeNode.width
    } );

    // Points sampled using Photoshop from a raster of the IEEE icon seen at
    // https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
    var schematicShape = new Shape()
      .moveTo( 0, 0 ) // left wire
      .lineTo( LEFT_JUNCTION, 0 )
      .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
      .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 )
      .moveTo( RIGHT_JUNCTION, 0 ) // right wire
      .lineTo( WIDTH, 0 )
      .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
      .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );
    var schematicWidth = schematicShape.bounds.width;
    var desiredWidth = lifelikeNode.width;
    var schematicScale = desiredWidth / schematicWidth;

    // Scale to fit the correct width
    schematicShape = schematicShape.transformed( Matrix3.scale( schematicScale, schematicScale ) );
    var schematicNode = new Path( schematicShape, {
      stroke: 'black',
      lineWidth: CircuitConstructionKitConstants.SCHEMATIC_LINE_WIDTH
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy();
    schematicNode.touchArea = schematicNode.bounds.copy();

    // Center vertically to match the FixedLengthCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;
    schematicNode.centerY = 0;

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitLayerNode,
      battery,
      viewProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );
  }

  circuitConstructionKitCommon.register( 'BatteryNode', BatteryNode );

  return inherit( FixedLengthCircuitElementNode, BatteryNode, {

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint: function( point ) {

      // Check against the mouse region
      return !!this.hitTest( point, true, false );
    }
  } );
} );