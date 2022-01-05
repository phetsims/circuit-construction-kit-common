// Copyright 2015-2021, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Switch.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import { FireListener } from '../../../scenery/js/imports.js';
import { Circle } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Path } from '../../../scenery/js/imports.js';
import { Rectangle } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import { Gradient } from '../../../scenery/js/imports.js';
import { LinearGradient } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Switch from '../model/Switch.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';

// constants
// dimensions for schematic battery
const LIFELIKE_DIAMETER = 16;
const SWITCH_START = CCKCConstants.SWITCH_START;
const SWITCH_END = CCKCConstants.SWITCH_END;
const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;

const lifelikeNodeThickness = 8;
const lifelikeGradient = new LinearGradient( 0, -lifelikeNodeThickness / 2, 0, lifelikeNodeThickness / 2 )
  .addColorStop( 0, '#d48270' )
  .addColorStop( 0.3, '#e39b8c' )
  .addColorStop( 1, '#b56351' );

type SegmentedNode = {
  leftSegmentNode: Node,
  rightSegmentNode: Node,
  rotatingSegmentNode: Node
} & Node;
/**
 * @param {CircuitElementViewType} viewType
 * @param {Color|string|LinearGradient} fill
 * @param {number} thickness
 * @param {number} curveDiameter - the diameter of the circles in the slots
 * @param {boolean} closed - whether the switch is closed
 * @returns {Node} with leftSegmentNode, rotatingSegmentNode and rightSegmentNode properties (also {Node})
 */
const createNode = function( viewType: CircuitElementViewType, fill: Gradient | Color, thickness: number, curveDiameter: number, closed: boolean ) {
  const edgeRadius = thickness / 2;

  const leftSegmentNode = new Rectangle( 0,
    -thickness / 2,
    SWITCH_LENGTH * SWITCH_START,
    thickness, {
      cornerRadius: edgeRadius,
      fill: fill,
      stroke: Color.BLACK,
      pickable: true // This is necessary because we use scenery hit testing for the probe hit testing
    } );

  // See the picture at https://github.com/phetsims/circuit-construction-kit-common/issues/313
  // This part has a curved notch that fits into the other segment
  const shape = new Shape()
    .moveTo( 0, thickness / 2 )
    .lineTo( SWITCH_LENGTH * SWITCH_START - curveDiameter, thickness / 2 )

    // similar to the notch below
    .arc( SWITCH_LENGTH * SWITCH_START - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false )
    .arc( SWITCH_LENGTH * SWITCH_START + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true )
    .lineTo( SWITCH_LENGTH * SWITCH_START + curveDiameter, -thickness / 2 )

    .lineTo( 0, -thickness / 2 )
    .lineTo( 0, thickness / 2 );
  const rotatingSegmentNode = new Path( shape, {
    x: SWITCH_LENGTH * SWITCH_START,
    fill: fill,
    stroke: Color.BLACK,
    lineWidth: viewType === CircuitElementViewType.SCHEMATIC ? 0 : 1,
    pickable: true // This is necessary because we use scenery hit testing for the probe hit testing
  } );

  rotatingSegmentNode.rotation = closed ? 0 : -Math.PI / 4;

  const rightSegmentShape = new Shape()
    .moveTo( SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2 )

    // similar to the notch above
    .lineTo( SWITCH_LENGTH * SWITCH_END - curveDiameter, 0 )
    .arc( SWITCH_LENGTH * SWITCH_END - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false )
    .arc( SWITCH_LENGTH * SWITCH_END + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true )
    .lineTo( SWITCH_LENGTH * SWITCH_END + curveDiameter, -thickness / 2 )

    .lineTo( SWITCH_LENGTH - edgeRadius, -thickness / 2 )
    .arc( SWITCH_LENGTH - edgeRadius, 0, edgeRadius, -Math.PI / 2, Math.PI / 2 )
    .lineTo( SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2 );
  const rightSegmentNode = new Path( rightSegmentShape, {
    fill: fill,
    stroke: Color.BLACK,
    pickable: true
  } );

  const lifelikeHinge = new Circle( thickness * 0.6, {
    fill: '#a7a8ab',
    stroke: Color.BLACK,
    lineWidth: 4,
    x: SWITCH_LENGTH * SWITCH_START
  } );

  const node = new Node( {
    children: [ leftSegmentNode, rotatingSegmentNode, rightSegmentNode, lifelikeHinge ]
  } ) as SegmentedNode;

  if ( viewType === CircuitElementViewType.SCHEMATIC ) {
    node.addChild( new Circle( thickness * 0.6, {
      fill: Color.BLACK,
      stroke: Color.BLACK,
      lineWidth: 4,
      x: SWITCH_LENGTH * SWITCH_END
    } ) );
  }

  node.leftSegmentNode = leftSegmentNode;
  node.rotatingSegmentNode = rotatingSegmentNode;
  node.rightSegmentNode = rightSegmentNode;

  return node;
};

// Create all of the images
const lifelikeOpenNode = createNode(
  CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, false
);
const lifelikeOpenImage = lifelikeOpenNode.rasterized( { wrap: false } );

const lifelikeClosedNode = createNode(
  CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, true
);
const lifelikeClosedImage = lifelikeClosedNode.rasterized( { wrap: false } );

const schematicOpenImage = createNode(
  CircuitElementViewType.SCHEMATIC, Color.BLACK, CCKCConstants.SCHEMATIC_LINE_WIDTH, 0, false
).rasterized( { wrap: false } );

const schematicClosedImage = createNode(
  CircuitElementViewType.SCHEMATIC, Color.BLACK, CCKCConstants.SCHEMATIC_LINE_WIDTH, 0, true
).rasterized( { wrap: false } );

class SwitchNode extends FixedCircuitElementNode {
  readonly circuitSwitch: Switch;
  private readonly lifelikeOpenNode: Node;
  private readonly disposeSwitchNode: () => void;

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Switch} circuitSwitch
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( screenView: CCKCScreenView | null, circuitLayerNode: CircuitLayerNode | null, circuitSwitch: Switch,
               viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: Partial<FixedCircuitElementNodeOptions> ) {

    const lifelikeNode = new Node();
    const schematicNode = new Node();
    const closeListener = ( closed: boolean ) => {
      lifelikeNode.children = [ closed ? lifelikeClosedImage : lifelikeOpenImage ];
      schematicNode.children = [ closed ? schematicClosedImage : schematicOpenImage ];
    };
    circuitSwitch.closedProperty.link( closeListener );

    super(
      screenView,
      circuitLayerNode,
      circuitSwitch,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      providedOptions
    );

    // @public (read-only) {Switch} - the Switch rendered by this Node, equivalent to this.circuitElement
    this.circuitSwitch = circuitSwitch;

    let downPoint: Vector2 | null = null;

    // When the user taps the switch, toggle whether it is open or closed.
    const fireListener = new FireListener( {
      tandem: tandem.createTandem( 'fireListener' ),
      attach: false,
      press: ( event: any ) => {
        downPoint = circuitLayerNode!.globalToLocalPoint( event.pointer.point );
      },
      fire: ( event: any ) => {

        // Measure how far the switch was dragged in CircuitLayerNode coordinates (if any)
        const distance = circuitLayerNode!.globalToLocalPoint( event.pointer.point ).distance( downPoint! );

        // Toggle the state of the switch, but only if the event is classified as a tap and not a drag
        if ( distance < CCKCConstants.TAP_THRESHOLD ) {
          circuitSwitch.closedProperty.value = !circuitSwitch.closedProperty.value;
        }
      }
    } );

    // Only add the input listener if it is not for a toolbar icon
    screenView && this.contentNode.addInputListener( fireListener );

    // @private {Node} - For hit testing
    this.lifelikeOpenNode = createNode(
      CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, false
    );

    // @private {function} - clean up resources when no longer used.
    this.disposeSwitchNode = () => {
      circuitSwitch.closedProperty.unlink( closeListener );
      screenView && this.contentNode.removeInputListener( fireListener );

      // Make sure the lifelikeNode and schematicNode are not listed as parents for their children because the children
      // (images) persist.
      lifelikeNode.dispose();
      schematicNode.dispose();
      fireListener.interrupt();
      fireListener.dispose();
    };
  }

  /**
   * Determine whether the start side (with the pivot) contains the sensor point.
   * @param {Vector2} point - in view coordinates
   * @returns {boolean}
   * @public
   */
  startSideContainsSensorPoint( point: Vector2 ) {
    const localPoint = this.contentNode.parentToLocalPoint( point );
    const leftSegmentContainsPoint = lifelikeOpenNode.leftSegmentNode.containsPoint( localPoint );
    const node = this.circuitSwitch.closedProperty.get() ? lifelikeClosedNode : lifelikeOpenNode;
    const rotatingSegmentContainsPoint = node.rotatingSegmentNode.containsPoint( localPoint );
    return leftSegmentContainsPoint || rotatingSegmentContainsPoint;
  }

  /**
   * Determine whether the end side (with the pivot) contains the sensor point.
   * @param {Vector2} point - in view coordinates
   * @returns {boolean}
   * @public
   */
  endSideContainsSensorPoint( point: Vector2 ) {
    const localPoint = this.contentNode.parentToLocalPoint( point );
    return lifelikeOpenNode.rightSegmentNode.containsPoint( localPoint );
  }

  /**
   * Returns true if the node hits the sensor at the given point.
   * @param {Vector2} globalPoint
   * @returns {boolean}
   * @overrides
   * @public
   */
  containsSensorPoint( globalPoint: Vector2 ) {

    const localPoint = this.globalToParentPoint( globalPoint );

    // make sure bounds are correct if cut or joined in this animation frame
    this.step();

    return this.startSideContainsSensorPoint( localPoint ) || this.endSideContainsSensorPoint( localPoint );
  }

  /**
   * Clean up resources when no longer used.
   * @public
   * @override
   */
  dispose() {
    this.disposeSwitchNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'SwitchNode', SwitchNode );
export default SwitchNode;