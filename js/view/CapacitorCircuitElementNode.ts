// Copyright 2015-2021, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Bounds3 from '../../../dot/js/Bounds3.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import CapacitorConstants from '../../../scenery-phet/js/capacitor/CapacitorConstants.js';
import CapacitorNode from '../../../scenery-phet/js/capacitor/CapacitorNode.js';
import YawPitchModelViewTransform3 from '../../../scenery-phet/js/capacitor/YawPitchModelViewTransform3.js';
import { Image } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Path } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import wireIconImage from '../../images/wire-icon_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Capacitor from '../model/Capacitor.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import Vector2 from '../../../dot/js/Vector2.js';

// constants
// dimensions for schematic
const SMALL_TERMINAL_WIDTH = 104;
const LARGE_TERMINAL_WIDTH = 104;
const WIDTH = 188;
const GAP = 30;
const LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
const RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;

// Points sampled using Photoshop from a raster of the IEEE icon seen at
// https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
let leftSchematicShape = new Shape()
  .moveTo( 0, 0 ) // left wire
  .lineTo( LEFT_JUNCTION, 0 )
  .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
  .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 );

let rightSchematicShape = new Shape()
  .moveTo( RIGHT_JUNCTION, 0 ) // right wire
  .lineTo( WIDTH, 0 )
  .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
  .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );

// Tuned the scale so the component fits exactly between the vertices
const SCHEMATIC_SCALE = CCKCConstants.CAPACITOR_LENGTH / WIDTH;

// Scale to fit the correct width
leftSchematicShape = leftSchematicShape.transformed( Matrix3.scale( SCHEMATIC_SCALE, SCHEMATIC_SCALE ) );
rightSchematicShape = rightSchematicShape.transformed( Matrix3.scale( SCHEMATIC_SCALE, SCHEMATIC_SCALE ) );

class CapacitorCircuitElementNode extends FixedCircuitElementNode {
  private readonly capacitor: Capacitor;
  readonly capacitorCircuitElementLifelikeNode: CapacitorNode;
  readonly capacitorCircuitElementSchematicNode: Node;
  private readonly leftWireStub: Node;
  private readonly rightWireStub: Node;
  private readonly leftSchematicPath: Path;
  private readonly leftSchematicHitAreaPath: Path;
  private readonly rightSchematicPath: Path;
  private readonly rightSchematicHitAreaPath: Path;
  private readonly disposeCapacitorCircuitElementNode: () => void;

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Capacitor} capacitor
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( screenView: CCKCScreenView | null, circuitLayerNode: CircuitLayerNode | null, capacitor: Capacitor, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: Partial<FixedCircuitElementNodeOptions> ) {

    providedOptions = merge( {
      isIcon: false
    }, providedOptions );

    const wireStubOptions = {

      // mark as pickable so we can perform hit testing with the voltmeter probes
      pickable: true
    };

    const thickness = 0.01414213562373095;
    const plateBounds = new Bounds3( 0, 0, 0, thickness, CapacitorConstants.PLATE_HEIGHT, thickness );
    const plateSeparationProperty = new NumberProperty( 0.004 );

    // TODO: See https://github.com/phetsims/circuit-construction-kit-common/issues/632 Can we instead create a Capacitor?
    // This is definitely a case where Typescript would be unhappy, and if this is needed, then it should be explicitly
    // documented in CapacitorNode.
    const circuit = {
      maxPlateCharge: 2.6562e-12,
      capacitor: {
        plateSizeProperty: new Property( plateBounds ),
        plateSeparationProperty: plateSeparationProperty,
        plateVoltageProperty: new NumberProperty( 1.5 ),
        plateChargeProperty: new NumberProperty( 0 ),
        getEffectiveEField: () => 0
      }
    };

    const modelViewTransform = new YawPitchModelViewTransform3();
    const plateChargeVisibleProperty = new BooleanProperty( true );
    const electricFieldVisibleProperty = new BooleanProperty( true );

    const lifelikeNode = new CapacitorNode( circuit, modelViewTransform, plateChargeVisibleProperty, electricFieldVisibleProperty, {
      tandem: Tandem.OPTIONAL,
      orientation: Orientation.HORIZONTAL, // so the "-" charges are upside-up in the default orientation
      includeChargeNode: !providedOptions.isIcon,
      scale: 0.45,
      rotation: -Math.PI / 2,
      centerX: capacitor.distanceBetweenVertices / 2,
      centerY: 0 // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    } );

    // q = CV
    const capacitanceVoltageListener = Property.multilink( [
      capacitor.capacitanceProperty,
      capacitor.voltageDifferenceProperty
    ], ( C: number, V: number ) => {

      let q = 2E-13 * C * V;

      // Guard against noisy oscillations around 0
      if ( Math.abs( q ) < 1E-18 ) {
        q = 0;
      }
      circuit.capacitor.plateChargeProperty.set( -q );
    } );

    const leftWireStub = new Image( wireIconImage, merge( {
      centerX: lifelikeNode.centerX,
      centerY: lifelikeNode.centerY
    }, wireStubOptions ) );
    const rightWireStub = new Image( wireIconImage, merge( {
      centerX: lifelikeNode.centerX,
      centerY: lifelikeNode.centerY
    }, wireStubOptions ) );

    const schematicPathOptions = {
      stroke: Color.BLACK,
      lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH,
      strokePickable: true,
      pickable: true // so that we can use hit detection for the voltmeter probes.
    };

    const schematicPathHitAreaOptions = {
      stroke: null,
      lineWidth: 15,
      strokePickable: true,
      pickable: true // so that we can use hit detection for the voltmeter probes.
    };
    const leftSchematicPath = new Path( leftSchematicShape, schematicPathOptions );
    const rightSchematicPath = new Path( rightSchematicShape, schematicPathOptions );

    // Wrap in another layer so it can be used for clipping
    const schematicNode = new Node( {
      children: [ leftSchematicPath, rightSchematicPath ]
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.localBounds.dilated( 2 );
    schematicNode.touchArea = schematicNode.localBounds.dilated( 2 );

    // NOTE: This is backwards, x is somehow vertical
    lifelikeNode.mouseArea = lifelikeNode.localBounds.erodedX( 45 ).dilatedY( 12 );
    lifelikeNode.touchArea = lifelikeNode.localBounds.erodedX( 45 ).dilatedY( 12 );

    const lifelikeNodeContainer = new Node( {
      children: [ lifelikeNode, leftWireStub, rightWireStub ]
    } );
    super(
      screenView,
      circuitLayerNode,
      capacitor,
      viewTypeProperty,
      lifelikeNodeContainer,
      schematicNode,
      tandem,
      providedOptions
    );

    // @public (read-only) {Capacitor} - the Capacitor rendered by this Node
    this.capacitor = capacitor;

    // @public (read-only) {Node} - for clipping in ChargeNode
    this.capacitorCircuitElementLifelikeNode = lifelikeNode;

    // @public (read-only) {Node} - for clipping in ChargeNode
    this.capacitorCircuitElementSchematicNode = schematicNode;

    // @private {Image}
    this.leftWireStub = leftWireStub;
    this.rightWireStub = rightWireStub;

    // @private {Path}
    this.leftSchematicPath = leftSchematicPath;
    this.rightSchematicPath = rightSchematicPath;
    this.leftSchematicHitAreaPath = new Path( leftSchematicShape, schematicPathHitAreaOptions );
    this.rightSchematicHitAreaPath = new Path( rightSchematicShape, schematicPathHitAreaOptions );

    schematicNode.addChild( this.leftSchematicHitAreaPath );
    schematicNode.addChild( this.rightSchematicHitAreaPath );
    capacitor.capacitanceProperty.link( capacitance => {

      // compute proportionality constant based on defaults.
      const k = 0.1 * 0.004;

      // inverse relationship between plate separation and capacitance.
      plateSeparationProperty.value = k / capacitance;

      // Adjust clipping region of wires accordingly
      const topPlateCenterToGlobal = this.capacitorCircuitElementLifelikeNode.getTopPlateClipShapeToGlobal();
      leftWireStub.clipArea = topPlateCenterToGlobal.transformed( leftWireStub.getGlobalToLocalMatrix() );

      const bottomPlateCenterToGlobal = this.capacitorCircuitElementLifelikeNode.getBottomPlateClipShapeToGlobal();
      rightWireStub.clipArea = bottomPlateCenterToGlobal.transformed( rightWireStub.getGlobalToLocalMatrix() );
    } );

    // @private
    this.disposeCapacitorCircuitElementNode = () => {
      capacitanceVoltageListener.dispose();
      lifelikeNode.dispose();
    };
  }

  // @public
  dispose() {
    this.disposeCapacitorCircuitElementNode();
    super.dispose();
  }

  /**
   * Returns true if the node hits the sensor at the given point.
   * @param {Vector2} globalPoint
   * @returns {boolean}
   * @overrides
   * @public
   */
  containsSensorPoint( globalPoint: Vector2 ) {

    // make sure bounds are correct if cut or joined in this animation frame
    this.step();

    return this.frontSideContainsSensorPoint( globalPoint ) || this.backSideContainsSensorPoint( globalPoint );
  }

  /**
   * Determine whether the start side (with the pivot) contains the sensor point.
   * @param {Vector2} globalPoint
   * @returns {boolean}
   * @public
   */
  frontSideContainsSensorPoint( globalPoint: Vector2 ) {

    if ( this.viewTypeProperty.value === 'lifelike' ) {
      return this.capacitorCircuitElementLifelikeNode.frontSideContainsSensorPoint( globalPoint ) ||
             this.leftWireStub.containsPoint( this.leftWireStub.globalToParentPoint( globalPoint ) );
    }
    else {
      return this.leftSchematicHitAreaPath.containsPoint( this.leftSchematicHitAreaPath.globalToParentPoint( globalPoint ) );
    }
  }

  /**
   * Determine whether the end side (with the pivot) contains the sensor point.
   * @param {Vector2} globalPoint
   * @returns {boolean}
   * @public
   */
  backSideContainsSensorPoint( globalPoint: Vector2 ) {

    if ( this.viewTypeProperty.value === 'lifelike' ) {
      return this.capacitorCircuitElementLifelikeNode.backSideContainsSensorPoint( globalPoint ) ||
             this.rightWireStub.containsPoint( this.rightWireStub.globalToParentPoint( globalPoint ) );
    }
    else {
      return this.rightSchematicHitAreaPath.containsPoint( this.rightSchematicHitAreaPath.globalToParentPoint( globalPoint ) );
    }
  }

  /**
   * Gets the bounds for the highlight rectangle.
   * @returns {Bounds2}
   * @public
   */
  getHighlightBounds() {
    return this.viewTypeProperty.value === 'lifelike' ?
           this.contentNode.localBounds.erodedX( 22 ).erodedY( 15 ) :
           this.contentNode.localBounds.erodedX( 0 ).erodedY( 0 );
  }
}

/**
 * Identifies the images used to render this node so they can be pre-populated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
CapacitorCircuitElementNode.webglSpriteNodes = [ new Image( wireIconImage ) ];

circuitConstructionKitCommon.register( 'CapacitorCircuitElementNode', CapacitorCircuitElementNode );
export default CapacitorCircuitElementNode;