// Copyright 2016-2020, University of Colorado Boulder

/**
 * Renders a single charge. Electrons are shown as a sphere with a minus sign and conventional current is shown as an
 * arrow.  Electrons are shown when current is zero, but conventional current is not shown for zero current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Shape from '../../../kite/js/Shape.js';
import ElectronChargeNode from '../../../scenery-phet/js/ElectronChargeNode.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Capacitor from '../model/Capacitor.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import ConventionalCurrentArrowNode from './ConventionalCurrentArrowNode.js';

// constants
const ELECTRON_CHARGE_NODE = new ElectronChargeNode( {

  // Electrons are transparent to convey they are a representation rather than physical objects
  // Workaround for https://github.com/phetsims/circuit-construction-kit-dc/issues/160
  sphereOpacity: 0.75,
  minusSignOpacity: 0.75,

  // selected so an electron will exactly fit the width of a wire
  scale: 0.78
} ).rasterized( { wrap: false } );

const ARROW_NODE = new ConventionalCurrentArrowNode( Tandem.GLOBAL.createTandem( 'arrowNode' ) )
  .rasterized( { wrap: false } );

const ARROW_OFFSET = Matrix3.translation( -ARROW_NODE.width / 2, -ARROW_NODE.height / 2 );
const HALF_ROTATION = Matrix3.rotation2( Math.PI );

// scratch matrix that is used to set values to scenery
const NODE_MATRIX = new Matrix3();

// Below this amperage, no conventional current will be rendered.
const CONVENTIONAL_CHARGE_THRESHOLD = 1E-6;

// position the electron--note the offsets that were used to make it look exactly centered, see
// https://github.com/phetsims/circuit-construction-kit-dc/issues/104
const ELECTRON_OFFSET = Matrix3.translation( -ELECTRON_CHARGE_NODE.width / 2 - 0.5, -ELECTRON_CHARGE_NODE.height / 2 - 0.5 );

class ChargeNode extends Image {

  /**
   * @param {Charge} charge - the model element
   * @param {CircuitLayerNode} circuitLayerNode
   */
  constructor( charge, circuitLayerNode ) {

    const child = charge.charge > 0 ? ARROW_NODE : ELECTRON_CHARGE_NODE;

    super( child.image, {
      pickable: false
    } );

    // @private - to look up the CapacitorNode for clipping
    this.circuitLayerNode = circuitLayerNode;

    // @public (read-only) {Charge} - the model depicted by this node
    this.charge = charge;

    this.outsideOfBlackBoxProperty = new BooleanProperty( false );

    // Update the visibility accordingly.  A multilink will not work because the charge circuitElement changes.
    this.updateVisibleListener = this.updateVisible.bind( this );

    // When the model position changes, update the node position.
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

    NODE_MATRIX.set( charge.matrix );

    if ( charge.charge > 0 ) {

      // Rotate if current is running backwards
      ( current < 0 ) && NODE_MATRIX.multiplyMatrix( HALF_ROTATION );

      // Center
      NODE_MATRIX.multiplyMatrix( ARROW_OFFSET );

      // Apply the transform
      this.matrix = NODE_MATRIX;

      let opacity = Utils.linear( 0.015, CONVENTIONAL_CHARGE_THRESHOLD, 1, 0, Math.abs( charge.circuitElement.currentProperty.get() ) );
      opacity = Utils.clamp( opacity, 0, 1 );
      this.setImageOpacity( opacity );
    }
    else {

      // Set rotation to 0 since electrons should always be upside-up
      NODE_MATRIX.set00( 1 );
      NODE_MATRIX.set01( 0 );
      NODE_MATRIX.set10( 0 );
      NODE_MATRIX.set11( 1 );

      // Center the electrons
      NODE_MATRIX.multiplyMatrix( ELECTRON_OFFSET );

      // Apply the transform
      this.matrix = NODE_MATRIX;
    }
    this.updateVisible();
    this.outsideOfBlackBoxProperty.set( !charge.circuitElement.insideTrueBlackBoxProperty.get() );

    // In order to show that no actual charges transfer between the plates of a capacitor, we clip their rendering.
    if ( this.charge.circuitElement instanceof Capacitor ) {
      const capacitorCircuitElementNode = this.circuitLayerNode.getCircuitElementNode( this.charge.circuitElement );

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