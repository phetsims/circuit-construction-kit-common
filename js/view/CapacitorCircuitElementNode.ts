// Copyright 2015-2023, University of Colorado Boulder

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
import { Shape } from '../../../kite/js/imports.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import CapacitorConstants from '../../../scenery-phet/js/capacitor/CapacitorConstants.js';
import CapacitorNode from '../../../scenery-phet/js/capacitor/CapacitorNode.js';
import YawPitchModelViewTransform3 from '../../../scenery-phet/js/capacitor/YawPitchModelViewTransform3.js';
import { Color, Image, ImageOptions, Node, Path } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import wireIcon_png from '../../images/wireIcon_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Capacitor from '../model/Capacitor.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Multilink from '../../../axon/js/Multilink.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';

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

export default class CapacitorCircuitElementNode extends FixedCircuitElementNode {
  private readonly capacitor: Capacitor;

  // for clipping in ChargeNode
  public readonly capacitorCircuitElementLifelikeNode: CapacitorNode;

  // for clipping in ChargeNode
  public readonly capacitorCircuitElementSchematicNode: Node;
  private readonly leftWireStub: Node;
  private readonly rightWireStub: Node;
  private readonly leftSchematicPath: Path;
  private readonly leftSchematicHitAreaPath: Path;
  private readonly rightSchematicPath: Path;
  private readonly rightSchematicHitAreaPath: Path;
  private readonly disposeCapacitorCircuitElementNode: () => void;

  // Identifies the images used to render this node so they can be pre-populated in the WebGL sprite sheet.
  public static override readonly webglSpriteNodes = [ new Image( wireIcon_png ) ];

  /**
   * @param screenView - main screen view, null for isIcon
   * @param circuitNode, null for icon
   * @param capacitor
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, capacitor: Capacitor, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: FixedCircuitElementNodeOptions ) {

    providedOptions = combineOptions<FixedCircuitElementNodeOptions>( {
      isIcon: false
    }, providedOptions );

    const wireStubOptions = {

      // mark as pickable so we can perform hit testing with the voltmeter probes
      pickable: true
    };

    const thickness = 0.01414213562373095;
    const plateBounds = new Bounds3( 0, 0, 0, thickness, CapacitorConstants.PLATE_HEIGHT, thickness );
    const plateSeparationProperty = new NumberProperty( 0.004 );

    // TODO (AC): See https://github.com/phetsims/circuit-construction-kit-common/issues/632 Can we instead create a Capacitor?
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
    const capacitanceVoltageListener = Multilink.multilink( [
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

    const leftWireStub = new Image( wireIcon_png, combineOptions<ImageOptions>( {
      centerX: lifelikeNode.centerX,
      centerY: lifelikeNode.centerY
    }, wireStubOptions ) );
    const rightWireStub = new Image( wireIcon_png, combineOptions<ImageOptions>( {
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
      circuitNode,
      capacitor,
      viewTypeProperty,
      lifelikeNodeContainer,
      schematicNode,
      tandem,
      providedOptions
    );

    this.capacitor = capacitor;
    this.capacitorCircuitElementLifelikeNode = lifelikeNode;
    this.capacitorCircuitElementSchematicNode = schematicNode;

    this.leftWireStub = leftWireStub;
    this.rightWireStub = rightWireStub;

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

    this.disposeCapacitorCircuitElementNode = () => {
      capacitanceVoltageListener.dispose();
      lifelikeNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeCapacitorCircuitElementNode();
    super.dispose();
  }

  /**
   * Returns true if the node hits the sensor at the given point.
   */
  public override containsSensorPoint( globalPoint: Vector2 ): boolean {

    // make sure bounds are correct if cut or joined in this animation frame
    this.step();

    return this.frontSideContainsSensorPoint( globalPoint ) || this.backSideContainsSensorPoint( globalPoint );
  }

  /**
   * Determine whether the start side (with the pivot) contains the sensor point.
   */
  public frontSideContainsSensorPoint( globalPoint: Vector2 ): boolean {

    if ( this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ) {
      return this.capacitorCircuitElementLifelikeNode.frontSideContainsSensorPoint( globalPoint ) ||
             this.leftWireStub.containsPoint( this.leftWireStub.globalToParentPoint( globalPoint ) );
    }
    else {
      return this.leftSchematicHitAreaPath.containsPoint( this.leftSchematicHitAreaPath.globalToParentPoint( globalPoint ) );
    }
  }

  /**
   * Determine whether the end side (with the pivot) contains the sensor point.
   */
  public backSideContainsSensorPoint( globalPoint: Vector2 ): boolean {

    if ( this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ) {
      return this.capacitorCircuitElementLifelikeNode.backSideContainsSensorPoint( globalPoint ) ||
             this.rightWireStub.containsPoint( this.rightWireStub.globalToParentPoint( globalPoint ) );
    }
    else {
      return this.rightSchematicHitAreaPath.containsPoint( this.rightSchematicHitAreaPath.globalToParentPoint( globalPoint ) );
    }
  }

  /**
   * Gets the bounds for the highlight rectangle.
   */
  public override getHighlightBounds(): Bounds2 {
    return this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ?
           this.contentNode.localBounds.erodedX( 22 ).erodedY( 15 ) :
           this.contentNode.localBounds.dilatedX( 10 ).dilatedY( 10 );
  }
}

circuitConstructionKitCommon.register( 'CapacitorCircuitElementNode', CapacitorCircuitElementNode );