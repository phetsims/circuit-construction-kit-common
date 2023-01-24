// Copyright 2015-2023, University of Colorado Boulder

/**
 * Shows the socket (base) of the light bulb only, so that it will appear that the charges go "inside" the base.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import { Rectangle } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import LightBulb from '../model/LightBulb.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import CustomLightBulbNode from './CustomLightBulbNode.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';

// constants
const SCRATCH_MATRIX = new Matrix3();

export default class LightBulbSocketNode extends FixedCircuitElementNode {

  /**
   * @param screenView - main screen view, null for icon
   * @param circuitNode, null for icon
   * @param lightBulb - the light bulb model
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, lightBulb: LightBulb,
                      viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: FixedCircuitElementNodeOptions ) {

    // Render the bulb socket only
    const lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      isExtreme: lightBulb.isExtreme,
      isReal: lightBulb.isReal
    } );

    // Interferes with Cut Button selection when the foreground is in front, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    providedOptions = combineOptions<FixedCircuitElementNodeOptions>( {
      pickable: false,

      // Suppress the highlight for the socket, the highlight is shown by the CCKCLightBulbNode
      showHighlight: false
    }, providedOptions );
    super( screenView, circuitNode, lightBulb, viewTypeProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ),
      tandem, providedOptions );
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * CCKCLightBulbNode calls updateRender for its child socket node
   */
  public override updateRender(): void {
    const startPosition = this.circuitElement.startPositionProperty.get();
    const endPosition = this.circuitElement.endPositionProperty.get();
    const angle = endPosition.minus( startPosition ).angle + Math.PI / 4;

    // Update the node transform in a single step, see #66
    this.contentNode.setMatrix( SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle ) );
  }

  /**
   * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
   */
  public override updateOpacityOnInteractiveChange(): void {

    // TODO (black-box-study): Make the light bulb images look faded out.
  }
}

circuitConstructionKitCommon.register( 'LightBulbSocketNode', LightBulbSocketNode );