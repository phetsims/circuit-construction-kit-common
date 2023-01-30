// Copyright 2015-2023, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import { Shape } from '../../../kite/js/imports.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import { Color, Image, Path } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import batteryHigh_png from '../../images/batteryHigh_png.js';
import battery_png from '../../images/battery_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Battery from '../model/Battery.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';

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

export default class BatteryNode extends FixedCircuitElementNode {
  private readonly battery: Battery;

  // Identifies the images used to render this node so they can be pre-populated in the WebGL sprite sheet.
  public static override readonly webglSpriteNodes = [
    new Image( battery_png ),
    new Image( batteryHigh_png )
  ];

  /**
   * @param screenView - main screen view, null for isIcon
   * @param circuitNode, null for icon
   * @param battery
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, battery: Battery, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: FixedCircuitElementNodeOptions ) {

    providedOptions = combineOptions<FixedCircuitElementNodeOptions>( { useHitTestForSensors: true }, providedOptions );

    const lifelikeNode = new Image( battery.batteryType === 'normal' ? battery_png : batteryHigh_png );

    lifelikeNode.mutate( {
      scale: battery.distanceBetweenVertices / lifelikeNode.width
    } );

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    super(
      screenView,
      circuitNode,
      battery,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      providedOptions
    );

    this.battery = battery;
  }
}

circuitConstructionKitCommon.register( 'BatteryNode', BatteryNode );