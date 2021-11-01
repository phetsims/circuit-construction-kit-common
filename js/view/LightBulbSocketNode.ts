// Copyright 2015-2021, University of Colorado Boulder

/**
 * Shows the socket (base) of the light bulb only, so that it will appear that the charges go "inside" the base.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import merge from '../../../phet-core/js/merge.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import LightBulb from '../model/LightBulb.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import CustomLightBulbNode from './CustomLightBulbNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';

// constants
const SCRATCH_MATRIX = new Matrix3();

class LightBulbSocketNode extends FixedCircuitElementNode {

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( screenView: CCKCScreenView | null, circuitLayerNode: CircuitLayerNode | null, lightBulb: LightBulb,
               viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: Partial<FixedCircuitElementNodeOptions> ) {

    // Render the bulb socket only
    const lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      highResistance: lightBulb.highResistance,
      real: lightBulb.real
    } );

    // Interferes with Cut Button selection when the foreground is in front, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    providedOptions = merge( {
      pickable: false,

      // Suppress the highlight for the socket, the highlight is shown by the CCKCLightBulbNode
      showHighlight: false
    }, providedOptions );
    super( screenView, circuitLayerNode, lightBulb, viewTypeProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ),
      tandem, providedOptions );
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * @override
   * @public - CCKCLightBulbNode calls updateRender for its child socket node
   */
  updateRender() {
    const startPosition = this.circuitElement.startPositionProperty.get();
    const endPosition = this.circuitElement.endPositionProperty.get();
    const angle = endPosition.minus( startPosition ).angle + Math.PI / 4;

    // Update the node transform in a single step, see #66
    this.contentNode.setMatrix( SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle ) );
  }

  /**
   * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
   * @override
   * @public
   */
  updateOpacityOnInteractiveChange() {

    // TODO (black-box-study): Make the light bulb images look faded out.
  }
}

circuitConstructionKitCommon.register( 'LightBulbSocketNode', LightBulbSocketNode );
export default LightBulbSocketNode;