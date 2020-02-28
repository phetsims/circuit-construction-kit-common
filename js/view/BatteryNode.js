// Copyright 2015-2020, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import batteryHighImage from '../../images/battery-high_png.js';
import batteryImage from '../../images/battery_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Battery from '../model/Battery.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';

// constants
// dimensions for schematic battery
const SMALL_TERMINAL_WIDTH = 50;
const LARGE_TERMINAL_WIDTH = 104;
const WIDTH = 188;
const GAP = 33;
const LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
const RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;

// Points sampled using Photoshop from a raster of the IEEE icon seen at
// https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
let schematicShape = new Shape()
  .moveTo( 0, 0 ) // left wire
  .lineTo( LEFT_JUNCTION, 0 )
  .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
  .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 )
  .moveTo( RIGHT_JUNCTION, 0 ) // right wire
  .lineTo( WIDTH, 0 )
  .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
  .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );
const schematicWidth = schematicShape.bounds.width;
const desiredWidth = CCKCConstants.BATTERY_LENGTH;
const schematicScale = desiredWidth / schematicWidth;

// Scale to fit the correct width
schematicShape = schematicShape.transformed( Matrix3.scale( schematicScale, schematicScale ) );
const schematicNode = new Path( schematicShape, {
  stroke: Color.BLACK,
  lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
} ).rasterized( { wrap: false } );

schematicNode.centerY = 0;

// Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

class BatteryNode extends FixedCircuitElementNode {

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Battery} battery
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenView, circuitLayerNode, battery, viewTypeProperty, tandem, options ) {

    options = merge( { useHitTestForSensors: true }, options );
    const lifelikeNode = new Image( battery.batteryType === Battery.BatteryType.NORMAL ? batteryImage : batteryHighImage );

    lifelikeNode.mutate( {
      scale: battery.distanceBetweenVertices / lifelikeNode.width
    } );

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    super(
      screenView,
      circuitLayerNode,
      battery,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );

    // @public (read-only) {Battery} - the Battery rendered by this Node
    this.battery = battery;
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
BatteryNode.webglSpriteNodes = [
  new Image( batteryImage ),
  new Image( batteryHighImage )
];

circuitConstructionKitCommon.register( 'BatteryNode', BatteryNode );
export default BatteryNode;