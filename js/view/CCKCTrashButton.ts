// Copyright 2017-2025, University of Colorado Boulder

/**
 * Trash button that is used to delete components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import Path from '../../../scenery/js/nodes/Path.js';
import trashAltRegularShape from '../../../sherpa/js/fontawesome-5/trashAltRegularShape.js';
import { type RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';

export default class CCKCTrashButton extends CCKCRoundPushButton {

  /**
   * @param circuit - the circuit from which the CircuitElement can be removed
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( circuit: Circuit, tandem: Tandem, providedOptions?: RoundPushButtonOptions ) {

    super( combineOptions<RoundPushButtonOptions>( {
      touchAreaDilation: 5, // radius dilation for touch area
      content: new Path( trashAltRegularShape, {
        fill: 'black',
        scale: CCKCConstants.FONT_AWESOME_ICON_SCALE * 0.8
      } ),
      listener: () => {

        const circuitElement = circuit.selectionProperty.value;
        if ( circuitElement instanceof CircuitElement ) {

          // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {
            circuit.disposeCircuitElement( circuitElement );
          }
        }
      },
      isDisposable: false,
      tandem: tandem
    }, providedOptions ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCTrashButton', CCKCTrashButton );