// Copyright 2016-2021, University of Colorado Boulder

/**
 * Renders a single charge. Electrons are shown as a sphere with a minus sign and conventional current is shown as an
 * arrow.  Electrons are shown when current is zero, but conventional current is not shown for zero current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Utils from '../../../dot/js/Utils.js';
import Shape from '../../../kite/js/Shape.js';
import ElectronChargeNode from '../../../scenery-phet/js/ElectronChargeNode.js';
import { Node } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Capacitor from '../model/Capacitor.js';
import Charge from '../model/Charge.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import ConventionalCurrentArrowNode from './ConventionalCurrentArrowNode.js';
import CapacitorCircuitElementNode from './CapacitorCircuitElementNode.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';

// constants
const ELECTRON_CHARGE_NODE = new ElectronChargeNode( {

  // Electrons are transparent to convey they are a representation rather than physical objects
  // Workaround for https://github.com/phetsims/circuit-construction-kit-dc/issues/160
  sphereOpacity: 0.75,
  minusSignOpacity: 0.75,

  // selected so an electron will exactly fit the width of a wire
  scale: 0.78
} ).rasterized( { wrap: false } );

const ARROW_NODE = new ConventionalCurrentArrowNode( Tandem.GLOBAL_VIEW.createTandem( 'arrowNode' ) ).rasterized( { wrap: false } );

// Below this amperage, no conventional current will be rendered.
const CONVENTIONAL_CHARGE_THRESHOLD = 1E-6;

class ChargeNode extends Node {
  private readonly circuitLayerNode: CircuitLayerNode;
  private readonly charge: Charge;
  private readonly outsideOfBlackBoxProperty: BooleanProperty;
  private readonly updateVisibleListener: () => void;
  private readonly updateTransformListener: () => void;
  static webglSpriteNodes: Node[];

  /**
   * @param {Charge} charge - the model element
   * @param {CircuitLayerNode} circuitLayerNode
   */
  constructor( charge: Charge, circuitLayerNode: CircuitLayerNode ) {

    const child = charge.charge > 0 ? ARROW_NODE : ELECTRON_CHARGE_NODE;

    super( {
      pickable: false,
      children: [ child ]
    } );

    // @private - to look up the CapacitorNode for clipping
    this.circuitLayerNode = circuitLayerNode;

    // @public (read-only) {Charge} - the model depicted by this node
    this.charge = charge;

    // @private
    this.outsideOfBlackBoxProperty = new BooleanProperty( false );

    // @private {function} - Update the visibility accordingly.  A multilink will not work because the charge
    // circuitElement changes.
    this.updateVisibleListener = this.updateVisible.bind( this );

    // @private {function} - When the model position changes, update the node position.
    this.updateTransformListener = () => this.updateTransform();
    charge.changedEmitter.addListener( this.updateTransformListener );
    charge.visibleProperty.link( this.updateVisibleListener );
    this.outsideOfBlackBoxProperty.link( this.updateVisibleListener );

    charge.disposeEmitterCharge.addListener( this.dispose.bind( this ) );

    this.updateTransformListener();
  }

  /**
   * Dispose resources when no longer used.
   * @public
   */
  dispose() {
    this.charge.changedEmitter.removeListener( this.updateTransformListener );
    this.charge.visibleProperty.unlink( this.updateVisibleListener );
    this.outsideOfBlackBoxProperty.unlink( this.updateVisibleListener );
    super.dispose();
  }

  /**
   * @private - update the transform of the charge node
   */
  updateTransform() {
    const charge = this.charge;
    const current = charge.circuitElement.currentProperty.get();

    if ( charge.charge > 0 ) {
      this.translation = charge.matrix.getTranslation();
      this.rotation = charge.matrix.getRotation() + ( current > 0 ? Math.PI : 0 );

      const opacity = Utils.linear( 0.015, CONVENTIONAL_CHARGE_THRESHOLD, 1, 0, Math.abs( charge.circuitElement.currentProperty.get() ) );
      const clampedOpacity = Utils.clamp( opacity, 0, 1 );
      this.setOpacity( clampedOpacity );
    }
    else {

      // Electrons are always upside up
      this.translation = charge.matrix.getTranslation();
    }
    this.updateVisible();
    this.outsideOfBlackBoxProperty.set( !charge.circuitElement.insideTrueBlackBoxProperty.get() );

    // In order to show that no actual charges transfer between the plates of a capacitor, we clip their rendering.
    if ( this.charge.circuitElement instanceof Capacitor ) {
      const capacitorCircuitElementNode = this.circuitLayerNode.getCircuitElementNode( this.charge.circuitElement );
      assert && assert( capacitorCircuitElementNode instanceof CapacitorCircuitElementNode );
      if ( capacitorCircuitElementNode instanceof CapacitorCircuitElementNode ) {

        // For unknown reasons, the x and y coordinates are swapped here.  The values were determined empirically.
        let globalClipShape = null;

        const isLifelike = this.circuitLayerNode.model.viewTypeProperty.value === CircuitElementViewType.LIFELIKE;
        if ( isLifelike ) {

          // For the lifelike view, we clip based on the pseudo-3d effect, so the charges come from "behind" the edge
          // of the back plate and the "in front of" center of the front plate.
          // Clip area must be synchronized with CapacitorCircuitElementNode.js
          globalClipShape = this.charge.distance < this.charge.circuitElement.chargePathLength / 2 ?
                            capacitorCircuitElementNode.capacitorCircuitElementLifelikeNode.getTopPlateClipShapeToGlobal() : // close half of the capacitor, clip at plate center
                            capacitorCircuitElementNode.capacitorCircuitElementLifelikeNode.getBottomPlateClipShapeToGlobal(); // latter half of the capacitor, clip at plate edge
        }
        else {

          // For the schematic view, we clip out the center between the plates.
          // Tuned empirically based on metrics of the schematic shape.  If this is too fragile, the above approach can be used instead.
          const localShape = this.charge.distance < this.charge.circuitElement.chargePathLength / 2 ?
                             Shape.rect( -19.5, -50, 60, 100 ) : // latter half of the capacitor, clip when leaving the far plate.
                             Shape.rect( 61.5, -50, 60, 100 ); // close half of the capacitor, clip when entering the plate

          globalClipShape = localShape.transformed( capacitorCircuitElementNode.capacitorCircuitElementSchematicNode.getLocalToGlobalMatrix() );
        }

        this.clipArea = globalClipShape.transformed( this.getGlobalToLocalMatrix() );
      }
    }
    else {
      this.clipArea = null;
    }
  }

  /**
   * @private - update the visibility
   */
  updateVisible() {
    this.visible = this.charge.visibleProperty.get() &&
                   this.outsideOfBlackBoxProperty.get();
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
ChargeNode.webglSpriteNodes = [ ELECTRON_CHARGE_NODE, ARROW_NODE ];

circuitConstructionKitCommon.register( 'ChargeNode', ChargeNode );
export default ChargeNode;