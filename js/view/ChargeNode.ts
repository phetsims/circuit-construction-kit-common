// Copyright 2016-2023, University of Colorado Boulder

/**
 * Renders a single charge. Electrons are shown as a sphere with a minus sign and conventional current is shown as an
 * arrow.  Electrons are shown when current is zero, but conventional current is not shown for zero current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Utils from '../../../dot/js/Utils.js';
import { Shape } from '../../../kite/js/imports.js';
import ElectronChargeNode from '../../../scenery-phet/js/ElectronChargeNode.js';
import { Node } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Capacitor from '../model/Capacitor.js';
import Charge from '../model/Charge.js';
import CircuitNode from './CircuitNode.js';
import ConventionalCurrentArrowNode from './ConventionalCurrentArrowNode.js';
import CapacitorCircuitElementNode from './CapacitorCircuitElementNode.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Multilink from '../../../axon/js/Multilink.js';
import CCKCColors from './CCKCColors.js';

// constants
const ELECTRON_CHARGE_NODE = new ElectronChargeNode( {

  // Electrons are transparent to convey they are a representation rather than physical objects
  // Workaround for https://github.com/phetsims/circuit-construction-kit-dc/issues/160
  sphereOpacity: 0.75,
  minusSignOpacity: 0.75,

  // selected so an electron will exactly fit the width of a wire
  scale: 0.78
} ).rasterized( { wrap: false } );

const INITIAL_ARROW_NODE = new ConventionalCurrentArrowNode( Tandem.OPT_OUT ).rasterized( { wrap: false } );

const arrowNode = new Node( { children: [ INITIAL_ARROW_NODE ] } );

Multilink.multilink( [ CCKCColors.conventionalCurrentArrowFillProperty, CCKCColors.conventionalCurrentArrowStrokeProperty ],
  ( arrowFill, arrowStroke ) => {
    arrowNode.children = [ new ConventionalCurrentArrowNode( Tandem.OPT_OUT ).rasterized( { wrap: false } ) ];
  } );

// Below this amperage, no conventional current will be rendered.
const CONVENTIONAL_CHARGE_THRESHOLD = 1E-6;

export default class ChargeNode extends Node {
  private readonly circuitNode: CircuitNode;

  // the model depicted by this node
  private readonly charge: Charge;
  private readonly outsideOfBlackBoxProperty: BooleanProperty;
  private readonly updateVisibleListener: () => void;
  private readonly updateTransformListener: () => void;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static readonly webglSpriteNodes = [ ELECTRON_CHARGE_NODE, arrowNode ];

  /**
   * @param charge - the model element
   * @param circuitNode
   */
  public constructor( charge: Charge, circuitNode: CircuitNode ) {

    const child = charge.charge > 0 ? arrowNode : ELECTRON_CHARGE_NODE;

    super( {
      pickable: false,
      children: [ child ]
    } );

    charge.disposeEmitter.addListener( () => this.dispose() );

    // to look up the CapacitorNode for clipping
    this.circuitNode = circuitNode;

    this.charge = charge;

    this.outsideOfBlackBoxProperty = new BooleanProperty( false );

    // Update the visibility accordingly.  A multilink will not work because the charge circuitElement changes.
    this.updateVisibleListener = this.updateVisible.bind( this );

    // When the model position changes, update the node position.
    this.updateTransformListener = () => this.updateTransform();
    charge.changedEmitter.addListener( this.updateTransformListener );
    charge.visibleProperty.link( this.updateVisibleListener );
    this.outsideOfBlackBoxProperty.link( this.updateVisibleListener );

    this.updateTransformListener();
  }

  /**
   * Dispose resources when no longer used.
   */
  public override dispose(): void {
    this.charge.changedEmitter.removeListener( this.updateTransformListener );
    this.charge.visibleProperty.unlink( this.updateVisibleListener );
    this.outsideOfBlackBoxProperty.unlink( this.updateVisibleListener );
    super.dispose();
  }

  // update the transform of the charge node
  private updateTransform(): void {
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
      const capacitorCircuitElementNode = this.circuitNode.getCircuitElementNode( this.charge.circuitElement );
      if ( capacitorCircuitElementNode instanceof CapacitorCircuitElementNode ) {

        // For unknown reasons, the x and y coordinates are swapped here.  The values were determined empirically.
        let globalClipShape = null;

        const isLifelike = this.circuitNode.model.viewTypeProperty.value === CircuitElementViewType.LIFELIKE;
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

  private updateVisible(): void {
    this.visible = this.charge.visibleProperty.get() &&
                   this.outsideOfBlackBoxProperty.get();
  }
}

circuitConstructionKitCommon.register( 'ChargeNode', ChargeNode );